package com.portafolioDJ.dao;

import com.portafolioDJ.models.User;
import java.util.List;

public interface UserDAO {
    void addUser(User user);
    User getUserByUid(String uid);
    User getUserByEmail(String email);
    List<User> getAllUsers();
    List<User> getUsersByRole(String role);
    void updateUser(User user);
    void deleteUser(String uid);
}
