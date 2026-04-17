def validar_credenciales(usuario, password, db):
    return usuario in db and db[usuario] == password