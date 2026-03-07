import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

console.log('Model training worker initialized');
let _globalCtx = {};
let _model = null

const WEIGHTS = {
    rating: 0.5,
    genre: 0.35,    
    age: 0.15,
};

// 🔢 Normalize continuous values (rating, age) to 0–1 range
// Why? Keeps all features balanced so no one dominates training
// Formula: (val - min) / (max - min)
// Example: rating=4.5, minRating=1.0, maxRating=5.0 → 0.9
const normalize = (value, min, max) => (value - min) / ((max - min) || 1)

function makeContext(movies, users) {
    const ages = users.map(user => user.age);
    const ratings = movies.map(movie => movie.averageRating);
    
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const genres = [...new Set(movies.map(movie => movie.genre))];

    const genresIndex = Object.fromEntries(
        genres.map((genre, index) => [genre, index])
    );

    // Computar a média de idade dos avaliadores dos filmes (ajuda a personalizar)    
    const midAge = (minAge + maxAge) / 2;
    const ageSums = {};
    const ageCounts = {};

    users.forEach(user => {
        user.ratings.forEach(rating => {
            ageSums[rating.movie.title] = (ageSums[rating.movie.title] || 0) + user.age;
            ageCounts[rating.movie.title] = (ageCounts[rating.movie.title] || 0) + 1;
        })
    });

    const movieAvgAgeNorm = Object.fromEntries(
        movies.map(movie => {
            const avg = ageCounts[movie.title] ? ageSums[movie.title] / ageCounts[movie.title] : midAge;

            return [movie.title, normalize(avg, minAge, maxAge)];
        })
    );

    return {
        movies,
        users,
        genresIndex,
        movieAvgAgeNorm,
        minAge,
        maxAge,
        minRating,
        maxRating,
        numGenres: genres.length,
        dimentions: 2 + genres.length, // age + price + one-hot genres
    }
}

const oneHotWeighted = (index, length, weight) =>
    tf.oneHot(index, length).cast('float32').mul(weight)

function encodeMovie(movie, context) {
    // normalizando dados para ficar de 0 a 1 e aplicando pesos para balancear a importância de cada feature
    const rating = tf.tensor1d([
        normalize(movie.averageRating, context.minRating, context.maxRating) * WEIGHTS.rating
    ]);

    const genre = oneHotWeighted(
        context.genresIndex[movie.genre], 
        context.numGenres, 
        WEIGHTS.genre
    );

    const age = tf.tensor1d([
        (context.movieAvgAgeNorm[movie.title] ?? 0.5) * WEIGHTS.age
    ]);

    return tf.concat([rating, genre, age]);
}

function encodeUser(user, context) {
    if (user.ratings.length) {
        return tf.stack(
            user.ratings.map(
                rating => encodeMovie(rating.movie, context)
            )
        )
            .mean(0)
            .reshape([
                1,
                context.dimentions
            ])
    }

    return tf.concat1d(
        [
            tf.zeros([1]), // rating é ignorado,
            tf.tensor1d([
                normalize(user.age, context.minAge, context.maxAge)
                * WEIGHTS.age
            ]),
            tf.zeros([context.numGenres]), // genre ignorado,
        ]
    ).reshape([1, context.dimentions])
}

function createTrainingData(context) {
    const inputs = [];
    const labels = [];

    context.users
        .filter(user => user.ratings.length) // Ignorar usuários sem avaliações (sem dados para aprender)
        .forEach(user => {
            const userVector = encodeUser(user, context).dataSync();

            context.movies.forEach(movie => {
                const movieVector = encodeMovie(movie, context).dataSync();
                const label = user.ratings.some(rating => rating.movie.title === movie.title) ? 1 : 0;

                // combinar user + movie para criar um exemplo de treinamento
                inputs.push([...userVector, ...movieVector]);
                labels.push(label);
            })
        })

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),
        inputDimention: context.dimentions * 2, // userVector + movieVector
    }
}

// ====================================================================
// 📌 Exemplo de como um usuário é ANTES da codificação
// ====================================================================
/*
const exampleUser = {
    id: 201,
    name: 'Lucas Andrade',
    age: 28,
    ratings: [
        { id: 1, movie: { title: 'O Poderoso Chefão', genre: 'Drama', averageRating: 4.2 }, rating: 5 },
        { id: 2, movie: { title: 'O Poderoso Chefão II', genre: 'Drama', averageRating: 3.7 }, rating: 4 }
    ]
};
*/

// ====================================================================
// 📌 Após a codificação, o modelo NÃO vê nomes ou palavras.
// Ele vê um VETOR NUMÉRICO (todos normalizados entre 0–1).
// Exemplo: [rating_normalizado, idade_normalizada, genre_one_hot...]
//
// Suponha gêneros = ['drama', 'comédia', 'ação']
//
// Para Lucas (idade 28, gênero: drama),
// o vetor poderia ficar assim:
//
// [
//   0.45,            // peso do rating normalizado
//   0.60,            // idade normalizada
//   1, 0, 0,         // one-hot de gênero (drama = ativo)
// ]
//
// São esses números que vão para a rede neural.
// ====================================================================



// ====================================================================
// 🧠 Configuração e treinamento da rede neural
// ====================================================================
async function configureNeuralNetAndTrain(trainData) {
    const model = tf.sequential()

    // Camada de entrada
    // - inputShape: Número de features por exemplo de treino (trainData.inputDim)
    //   Exemplo: Se o vetor filme + usuário = 20 números, então inputDim = 20
    // - units: 128 neurônios (muitos "olhos" para detectar padrões)
    // - activation: 'relu' (mantém apenas sinais positivos, ajuda a aprender padrões não-lineares)
    model.add(
        tf.layers.dense({
            inputShape: [trainData.inputDimention],
            units: 128,
            activation: 'relu'
        })
    )

    // Camada oculta 1
    // - 64 neurônios (menos que a primeira camada: começa a comprimir informação)
    // - activation: 'relu' (ainda extraindo combinações relevantes de features)
    model.add(
        tf.layers.dense({
            units: 64,
            activation: 'relu'
        })
    )

    // Camada oculta 2
    // - 32 neurônios (mais estreita de novo, destilando as informações mais importantes)
    //   Exemplo: De muitos sinais, mantém apenas os padrões mais fortes
    // - activation: 'relu'
    model.add(
        tf.layers.dense({
            units: 32,
            activation: 'relu'
        })
    )
    
    // Camada de saída
    // - 1 neurônio porque vamos retornar apenas uma pontuação de recomendação
    // - activation: 'sigmoid' comprime o resultado para o intervalo 0–1
    //   Exemplo: 0.9 = recomendação forte, 0.1 = recomendação fraca
    model.add(
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
    )

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    })

    await model.fit(trainData.xs, trainData.ys, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch,
                    loss: logs.loss,
                    accuracy: logs.acc
                });
            }
        }
    })

    return model
}

async function trainModel({ users, movies }) {
    console.log('Training model with users:', users, 'and movies:', movies);

    if (!users || !movies) {
        console.error('Missing users or movies data for training');
        return;
    }

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 50 } });

    const context = makeContext(movies, users)    

    context.movieVectors = movies.map(movie => {
        return {
            title: movie.title,
            meta: { ...movie },
            vector: encodeMovie(movie, context).dataSync() // Convertendo tensor para array normal para facilitar o uso posterior
        }
    })    
       
    _globalCtx = context;

    const trainData = createTrainingData(context)
    _model = await configureNeuralNetAndTrain(trainData)
    
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });
}

function recommend(user, ctx) {
    if (!_model) return;
    const context = _globalCtx
    // 1️⃣ Converta o usuário fornecido no vetor de features codificadas
    //    (rating ignorado, idade normalizada, gêneros ignorados)
    //    Isso transforma as informações do usuário no mesmo formato numérico
    //    que foi usado para treinar o modelo.

    const userVector = encodeUser(user, context).dataSync()

    // Em aplicações reais:
    //  Armazene todos os vetores de filmes em um banco de dados vetorial (como Postgres, Neo4j ou Pinecone)
    //  Consulta: Encontre os 200 filmes mais próximos do vetor do usuário
    //  Execute _model.predict() apenas nesses filmes

    // 2️⃣ Crie pares de entrada: para cada filme, concatene o vetor do usuário
    //    com o vetor codificado do filme.
    //    Por quê? O modelo prevê o "score de compatibilidade" para cada par (usuário, filme).

    const inputs = context.movieVectors.map(({ vector }) => {
        return [...userVector, ...vector]
    })

    // 3️⃣ Converta todos esses pares (usuário, filme) em um único Tensor.
    //    Formato: [numFilmes, inputDim]
    const inputTensor = tf.tensor2d(inputs)

    // 4️⃣ Rode a rede neural treinada em todos os pares (usuário, filme) de uma vez.
    //    O resultado é uma pontuação para cada filme entre 0 e 1.
    //    Quanto maior, maior a probabilidade do usuário querer aquele filme.
    const predictions = _model.predict(inputTensor)

    // 5️⃣ Extraia as pontuações para um array JS normal.
    const scores = predictions.dataSync()
    const recommendations = context.movieVectors.map((item, index) => {
        return {
            ...item.meta,
            name: item.name,
            score: scores[index] // previsão do modelo para este filme
        }
    })

    const sortedItems = recommendations
        .sort((a, b) => b.score - a.score)

    // 8️⃣ Envie a lista ordenada de filmes recomendados
    //    para a thread principal (a UI pode exibi-los agora).
    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations: sortedItems
    });
}

const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: d => recommend(d.user, _globalCtx),
};

self.onmessage = e => {
    const { action, ...data } = e.data;

    if (handlers[action]) {
        handlers[action](data);
    }
};
