import express from 'express';
const router = express.Router();
import { promises as fs } from 'fs';

router.get('/', async (req, res, next) => {
	try {
		const { id } = req.query;
		const data = JSON.parse(await fs.readFile(global.fileName));
		const grade = data.grades.find(each => each.id == id);

		if (!grade) {
			res.status(404).send('Grade not found');
		} else {
			res.json(grade);
		}
	} catch (err) {
		next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		let grade = req.body;
		const data = JSON.parse(await fs.readFile(global.fileName));

		grade = { id: data.nextId++, ...grade, timestamp: new Date() };
		data.grades.push(grade);

		await fs.writeFile(global.fileName, JSON.stringify(data, null, 2));

		res.json(grade);
	} catch (err) {
		next(err);
	}
});

router.put('/', async (req, res, next) => {
	try {
		const { id } = req.query;
		const newGrade = req.body;
		const data = JSON.parse(await fs.readFile(global.fileName));

		let grade = data.grades.find(each => each.id == id);

		if (!grade) {
			res.status(404).send('Grade not found');
		} else {
			const gradeIndex = data.grades.findIndex(each => each.id == id);
			grade = { ...grade, ...newGrade };
			data.grades.splice(gradeIndex, 1, grade);
			await fs.writeFile(global.fileName, JSON.stringify(data, null, 2));

			res.json(grade);
		}
	} catch (err) {
		next(err);
	}
});

router.delete('/', async (req, res, next) => {
	try {
		const { id } = req.query;
		const data = JSON.parse(await fs.readFile(global.fileName));
		data.grades = data.grades.filter(each => each.id != id);
		await fs.writeFile(global.fileName, JSON.stringify(data, null, 2));

		res.send();
	} catch (err) {
		next(err);
	}
});

router.get('/total', async (req, res, next) => {
	try {
		const { student, subject } = req.body;

		const data = JSON.parse(await fs.readFile(global.fileName));
		const total = data.grades.reduce((totalG, grade) => {
			if (grade.student == student && grade.subject == subject) {
				return totalG + grade.value;
			} else {
				return totalG;
			}
		}, 0);

		res.json(total);
	} catch (err) {
		next(err);
	}
});

router.get('/average', async (req, res, next) => {
	try {
		const { subject, type } = req.body;

		const data = JSON.parse(await fs.readFile(global.fileName));
		const grades = data.grades.filter(grade => grade.type == type && grade.subject == subject);
		const total = grades.reduce((totalG, grade) => totalG + grade.value, 0);

		res.json(total / grades.length);
	} catch (err) {
		next(err);
	}
});

router.get('/best', async (req, res, next) => {
	try {
		const { subject, type } = req.body;

		const data = JSON.parse(await fs.readFile(global.fileName));
		const grades = data.grades
			.filter(grade => grade.type == type && grade.subject == subject)
			.sort((gradeA, gradeB) => gradeB.value - gradeA.value);

		res.json(grades.splice(0, 3));
	} catch (err) {
		next(err);
	}
});

router.use((err, req, res, next) => {
	logger.error(`[${req.method}] ${req.baseUrl} -> ${err.message}`);
	res.status(400).send({ error: err.message });
});

export default router;
