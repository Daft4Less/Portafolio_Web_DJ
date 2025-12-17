package com.portafolioDJ.dao;

import com.portafolioDJ.models.Asesoria;
import java.util.List;

public interface AsesoriaDAO {
    void addAsesoria(Asesoria asesoria);
    Asesoria getAsesoriaById(String id);
    List<Asesoria> getAllAsesorias();
    void updateAsesoria(Asesoria asesoria);
    void deleteAsesoria(String id);
}
