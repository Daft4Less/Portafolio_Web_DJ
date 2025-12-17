package com.portafolioDJ.dao;

import com.portafolioDJ.models.Project;
import java.util.List;

public interface ProjectDAO {
    void addProject(Project project);
    Project getProjectById(int id);
    List<Project> getAllProjects();
    void updateProject(Project project);
    void deleteProject(int id);
}
