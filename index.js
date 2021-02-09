import express from 'express';
import winston from 'winston';
import gradesRouter from './routes/grades.js';
import { promises as fs } from 'fs';

global.fileName = 'data/grades.json';

const { combine, timestamp, label, printf } = winston.format;
const loggerFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} - [${level}] ${label} -> ${message}`;
});
global.logger = winston.createLogger({
	level: 'debug',
	transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'desafio2.log' })],
	format: combine(label({ label: 'Desafio 2' }), timestamp(), loggerFormat),
});

const app = express();
app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(3000, async () => {
	try {
		await fs.readFile(global.fileName);
	} catch (err) {
		const initialJson = {
			nextId: 1,
			grades: [],
		};
		fs.writeFile(global.fileName, JSON.stringify(initialJson, null, 2)).catch(err =>
			logger.error('Erro ao criar arquivo: ' + err)
		);
	}

	logger.info('API Started');
});
