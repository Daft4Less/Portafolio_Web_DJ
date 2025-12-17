package com.portafolioDJ.dao;

import com.portafolioDJ.models.Schedule;
import java.util.List;

public interface ScheduleDAO {
    void addSchedule(Schedule schedule);
    Schedule getScheduleById(String id);
    List<Schedule> getAllSchedules();
    // Podríamos necesitar un método para obtener el horario de un programador específico
    List<Schedule> getSchedulesByProgrammerId(String programmerId); 
    void updateSchedule(Schedule schedule);
    void deleteSchedule(String id);
}
