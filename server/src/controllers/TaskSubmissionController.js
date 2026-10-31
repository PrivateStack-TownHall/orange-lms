// const { taskSubmissionService } = require("../services");

// class TaskSubmissionController {
//   static async getAll(req, res, next) {
//     try {
//       const submissions = await taskSubmissionService.findAll(req.user);

//       res.status(200).json(submissions);
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getByTask(req, res, next) {
//     try {
//       const submissions = await taskSubmissionService.findAllByTask(
//         req.params.TaskId,
//         req.user,
//       );

//       res.status(200).json(submissions);
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getById(req, res, next) {
//     try {
//       const submission = await taskSubmissionService.findById(
//         req.params.id,
//         req.user,
//       );

//       res.status(200).json(submission);
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async create(req, res, next) {
//     try {
//       const submission = await taskSubmissionService.create(req.user, {
//         ...req.body,
//         UserId: req.user.id,
//       });

//       res.status(201).json(submission);
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async update(req, res, next) {
//     try {
//       const submission = await taskSubmissionService.update(
//         req.params.id,
//         req.body,
//         req.user,
//       );

//       res.status(200).json(submission);
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async delete(req, res, next) {
//     try {
//       await taskSubmissionService.delete(req.params.id, req.user);

//       res.status(200).json({
//         message: "Submission deleted successfully",
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// module.exports = TaskSubmissionController;
