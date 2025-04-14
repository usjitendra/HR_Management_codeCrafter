// GET /api/attendance/chart/:id?month=2025-04
const getChartAttendance = async (req, res) => {
    const { id } = req.params;
    const { month } = req.query; // e.g., 2025-04
  
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
  
    const allDays = [];
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      allDays.push(new Date(d));
    }
  
    const data = await Attendance.find({
      employeeId: id,
      date: { $gte: startDate, $lt: endDate }
    });
  
    const chart = allDays.map(date => {
      const found = data.find(d => d.date.toDateString() === date.toDateString());
      return {
        date: date.toISOString().split("T")[0],
        status: found ? found.status : "no-data" // green, red, black logic in frontend
      };
    });
  
    res.status(200).json({ chart });
  };
  