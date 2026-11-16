const { DataTypes } = require("sequelize");
const sequelize = require("../db");

// Schema: attendance(id SERIAL PK, name VARCHAR NOT NULL, rollNo VARCHAR NOT NULL,
//                    date DATEONLY NOT NULL, status ENUM('Present','Absent','Late'), createdAt, updatedAt)
// Unique constraint on (rollNo, date) prevents duplicate entries for the same day.
module.exports = sequelize.define("Attendance", {
  name: { type: DataTypes.STRING, allowNull: false, validate: { len: [2, 100] } },
  rollNo: { type: DataTypes.STRING, allowNull: false, validate: { is: /^\d{1,6}$/ } },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM("Present", "Absent", "Late"), allowNull: false, defaultValue: "Present" },
}, { indexes: [{ unique: true, fields: ["rollNo", "date"] }] });
