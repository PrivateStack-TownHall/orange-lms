# 📦 Orange LMS — Database Schema (Sequelize Model Generator)

## 🧑‍🤝‍🧑 Core / Identity

1️⃣ Users
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string,role:string,avatarUrl:string,isActive:boolean

2️⃣ Profiles (1:1 dengan User)
npx sequelize-cli model:generate --name Profile --attributes userId:integer,age:integer,gender:string,address:string,city:string,country:string,background:text,phoneNumber:string

## 🏫 Class & Learning

3️⃣ Classes
npx sequelize-cli model:generate --name Class --attributes code:string,name:string,description:text,category:string,mentorId:integer,createdBy:integer,level:string,startDate:date,endDate:date,status:string,imageUrl:string

4️⃣ ClassUsers (pivot many-to-many: mentor/mentee ↔ class)
npx sequelize-cli model:generate --name ClassUser --attributes classId:integer,userId:integer,roleInClass:string,progressPercentage:decimal,status:string,assignedBy:integer,joinedAt:date

5️⃣ Meetings
npx sequelize-cli model:generate --name Meeting --attributes classId:integer,meetingNumber:integer,name:string,description:text,meetingDate:date,startHour:time,finishHour:time,createdBy:integer,imageUrl:string

6️⃣ Notes
npx sequelize-cli model:generate --name Note --attributes classId:integer,meetingId:integer,createdBy:integer,name:string,description:text,fileUrl:string

7️⃣ Materials
npx sequelize-cli model:generate --name Material --attributes classId:integer,meetingId:integer,name:string,description:text,type:string,fileUrl:string,uploadedBy:integer

8️⃣ Attendances
npx sequelize-cli model:generate --name Attendance --attributes meetingId:integer,userId:integer,status:string,checkedBy:integer,checkInAt:date,notes:text

9️⃣ HistoryClasses (arsip riwayat mentor/mentee setelah kelas selesai)
npx sequelize-cli model:generate --name HistoryClass --attributes classId:integer,userId:integer,roleInClass:string,status:string,finalScore:decimal,attendancePercentage:decimal,completedAt:date,remarks:text,certificateUrl:string

## 📝 Task & Assessment

🔟 Tasks
npx sequelize-cli model:generate --name Task --attributes classId:integer,meetingId:integer,name:string,description:text,createdBy:integer,dueDate:date,maxScore:integer,status:string,fileUrl:string

1️⃣1️⃣ TaskSubmissions
npx sequelize-cli model:generate --name TaskSubmission --attributes taskId:integer,userId:integer,submissionUrl:string,submittedNote:text,submissionFileUrl:string,status:string,score:integer,feedback:text,submittedAt:date,reviewedAt:date

1️⃣2️⃣ TaskCriteria (rubrik penilaian tiap task)
npx sequelize-cli model:generate --name TaskCriteria --attributes taskId:integer,title:string,percentage:decimal,maxScore:integer,order:integer,description:text,createdBy:integer

1️⃣3️⃣ AssessmentResults (1:1 dengan TaskSubmission)
npx sequelize-cli model:generate --name AssessmentResult --attributes taskSubmissionId:integer,gradedBy:integer,finalScore:decimal,mentorFeedback:text,gradedAt:date

1️⃣4️⃣ SubmissionCriteriaScores (pivot: AssessmentResult ↔ TaskCriteria)
npx sequelize-cli model:generate --name SubmissionCriteriaScore --attributes assessmentResultId:integer,taskCriteriaId:integer,score:decimal,note:text

## 🔔 Notification, Log & Activity

1️⃣5️⃣ Notifications
npx sequelize-cli model:generate --name Notification --attributes userId:integer,type:string,title:string,message:text,isRead:boolean,relatedType:string,relatedId:integer,classId:integer

1️⃣6️⃣ AuditLogs
npx sequelize-cli model:generate --name AuditLog --attributes userId:integer,role:string,action:string,resource:string,resourceId:integer,resourceDetail:string,ipAddress:string,device:string,metadata:json

1️⃣7️⃣ UserActivities
npx sequelize-cli model:generate --name UserActivity --attributes userId:integer,activity:string,description:string,classId:integer,resourceType:string,resourceId:integer,device:string
