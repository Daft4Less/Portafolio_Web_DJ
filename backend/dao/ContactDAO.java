package com.portafolioDJ.dao;

import com.portafolioDJ.models.Contact;

public interface ContactDAO {
    // El "id" aquí sería el ID del usuario al que pertenece este contacto.
    Contact getContactByUserId(String userId);
    void saveContact(String userId, Contact contact);
    void updateContact(String userId, Contact contact);
    void deleteContact(String userId);
}
