import db from '../config/db';

export const findUserByUsername = async (userName: string) => {
    const [rows]: any = await db.query(
        "SELECT * FROM login WHERE UserName = ? LIMIT 1",
        [userName]
    );
    return rows[0] || null;
};

export const createUser = async (userData: {
    UserName: string;
    Password: string;
    UserType: string;
    IsActive: number;
    Address: string | null;
    State: string | null;
    Mobile: string | null;
}) => {
    const [result]: any = await db.query(
        `INSERT INTO login (UserName, Password, UserType, IsActive, Address, State, Mobile) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            userData.UserName,
            userData.Password,
            userData.UserType,
            userData.IsActive,
            userData.Address || null,
            userData.State || null,
            userData.Mobile || null
        ]
    );
    const insertId = result.insertId;
    return {
        Id: insertId,
        UserName: userData.UserName,
        UserType: userData.UserType,
        IsActive: userData.IsActive,
        Address: userData.Address,
        State: userData.State,
        Mobile: userData.Mobile
    };
};
