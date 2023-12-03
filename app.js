const express = require('express');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/MCA');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
// Connect to MongoDB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connection Successful!");
});
var student = mongoose.Schema({
    UID: String,
    Name: String,
    Course1: String,
    Course2: String,
    Course3: String
});
const student_model = mongoose.model('student_model', student, 'Students');
var Course = mongoose.Schema({
    CID: String,
    Course_Name: String,
    Credits: Number
});
const course_model = mongoose.model('course_model', Course, 'Courses');
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});
app.get('/add_student', (req, res) => {
    res.sendFile(__dirname + '/add_student.html');
});
app.get('/add_course', (req, res) => {
    res.sendFile(__dirname + '/add_course.html');
});
app.get('/students', async (req, res) => {
    try {
        const students = await student_model.find({});
        res.json(students);
    } catch (error) {
        console.log('An error occurred while fetching the data:', error);
        res.status(500).send('An error occurred while fetching the data.');
    }
});
app.post('/add_student', async (req, res) => {
    try {
        const newData = new student_model({
            UID: req.body.id,
            Name: req.body.name,
            Course1: req.body.sub1,
            Course2: req.body.sub2,
            Course3: req.body.sub3
        });
        await newData.save();
        console.log('Student Added');
        return res.redirect('home.html');
    } catch (error) {
        console.log('An error occurred while saving the data.');
    }
});
app.post('/add_course', async (req, res) => {
    try {
        const newData = new course_model({
            CID: req.body.id,
            Course_Name: req.body.name,
            Credits: req.body.credits,
        });
        await newData.save();
        console.log("Course Added");
        return res.redirect('home.html');
    } catch (error) {
        console.log('An error occurred while saving the data.');
    }
});
app.post('/search', async (req, res) => {
    const { id } = req.body;
    try {
        const student = await student_model.findOne({ UID: id });
        const subject1 = await course_model.findOne({ CID: student.Course1 });
        const subject2 = await course_model.findOne({ CID: student.Course2 });
        const subject3 = await course_model.findOne({ CID: student.Course3 });
        const total = (subject1 ? subject1.Credits : 0)
            + (subject2 ? subject2.Credits : 0)
            + (subject3 ? subject3.Credits : 0);
        if (student) {
            return res.send(`
<link rel="stylesheet" 
href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
<div class="container mt-5">
<h1 class="text-center">Search Result</h1>
<div class="card mt-5">
<div class="card-body">
<h5 class="card-title">${student.Name}</h5>
<p class="card-text">UID: ${student.UID}</p>
<p class="card-text"><b>Course Code:${subject1 ? subject1.CID : 'N/A'} </b> 
&nbsp&nbsp&nbsp
<b>Course Name:${subject1 ? subject1.Course_Name : 'N/A'}</b> &nbsp&nbsp&nbsp 
(${subject1 ? subject1.Credits : 'N/A'} credits)</p>
<p class="card-text"><b>Course Code:${subject2 ? subject2.CID : 'N/A'} </b> 
&nbsp&nbsp&nbsp
<b>Course Name:${subject2 ? subject2.Course_Name : 'N/A'}</b> &nbsp&nbsp&nbsp 
(${subject2 ? subject2.Credits : 'N/A'} credits)</p>
<p class="card-text"><b>Course Code:${subject3 ? subject3.CID : 'N/A'} </b> 
&nbsp&nbsp&nbsp
<b>Course Name:${subject3 ? subject3.Course_Name : 'N/A'}</b> &nbsp&nbsp&nbsp
(${subject3 ? subject3.Credits : 'N/A'} credits)</p>
<p class="card-text">Total Credits: ${total}</p>
</div>
</div>
</div>
`);
        }
        else {
            return res.send('No Student found');
        }
    }
    catch (err) {
        console.error(err);
    }
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});