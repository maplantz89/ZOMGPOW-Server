const express = require('express');
const path = require('path');
const dataService = require('./data-service');
const { requireAuth } = require('../middleware/jwt-auth');

const dataRouter = express.Router();
const jsonBodyParser = express.json();


dataRouter
  .get('/:classId', requireAuth, async (req, res, next) => {

    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ error: 'Need class id' });
    }

    try {

      const dates = await dataService.getTimeForGoal(req.app.get('db'), classId)
      const completed = await dataService.getCompleted(req.app.get('db'), classId)
      const totalStudents = await dataService.getTotalStudents(req.app.get('db'), classId)
  
     
   

      let time;
      let dataArr = [];

      for (let i = 0; i < dates.length; i++) {
        let createdHours = Number(dates[i]['date_created'].getHours());
        let completedHours = Number(dates[i]['date_completed'].getHours());
        let createdMins = Number(dates[i]['date_created'].getMinutes());
        let completedMins = Number(dates[i]['date_completed'].getMinutes());
        let totalCreatedMins = (createdHours * 60) + createdMins;
        let totalCompletedMins = (completedHours * 60) + completedMins;
        let totalMins = totalCompletedMins - totalCreatedMins;
        let hours = Math.floor(totalMins / 60).toString();
        let mins = (totalMins % 60).toString();
        if (hours < 10) {
          hours = `0${hours}`;
        }
        if (mins < 10) {
          mins = `0${mins}`;
        }
        time = `${hours}h ${mins}m`
      
        dataArr.push({ id: dates[i]["id"], goal_title: dates[i]["goal_title"], time: time,})
      
      }

      for (let i = 0; i < dataArr.length; i++) {
        for (let j = 0; j < completed.length; j++) {
          if (completed[j].id === dataArr[i].id) {
            dataArr[i]["total_completed"] = completed[j]["completed"]
            dataArr[i]["total_students"] = totalStudents[j]["total_students"]
            dataArr[i]["avg_completed"] = `${Math.ceil(Number(completed[j]["completed"]) / Number(totalStudents[j]["total_students"]) * 100)}%`
            dataArr[i]["eval_total"] = totalStudents[j]["eval_total"]
            dataArr[i]["eval_avg"] = Number(totalStudents[j]["eval_avg"]).toFixed(2);
            dataArr[i]["eval_percentage"] = `${(((Number(totalStudents[j]["eval_avg"])) / 3) * 100).toFixed(0)}%`;

          }
        }
      }

      res.status(200).json({ dataArr });
    }
    catch (e) {
      next(e);
    }
  })
  .get('/:classId/:goalId', requireAuth, async (req, res, next) => {
    const { classId, goalId } = req.params;
    try {
      const studentResponses = await dataService.getStudentResponses(req.app.get('db'), classId, goalId)
      const exitTicketInfo = await dataService.getExitTicketInfo(req.app.get('db'), goalId)
      const correctResponse = await dataService.getCorrectResponse(req.app.get('db'), goalId, exitTicketInfo[0].answer)
      let correctPer = `${(Number(correctResponse[0].correct_response) / studentResponses.length * 100).toFixed(0)}%`
  
      exitTicketInfo[0]['correct_res_total'] = correctResponse[0].correct_response;
      exitTicketInfo[0]['res_total'] = studentResponses.length;
      exitTicketInfo[0]['correct_res_avg'] = correctPer;
      res.status(200).json({ studentResponses, exitTicketInfo })
    }
    catch (e) {
      next(e)
    }
  })
  .get('/:classId/:goalId/:studentGoalId', requireAuth, async (req, res, next) => {
    const { studentGoalId } = req.params;

    try {
      const studentSubgoals = await dataService.getStudentSubgoals(req.app.get('db'), studentGoalId)
      res.status(200).json({ studentSubgoals })
    }
    catch (e) {
      next(e)
    }
  });



 

module.exports = dataRouter;