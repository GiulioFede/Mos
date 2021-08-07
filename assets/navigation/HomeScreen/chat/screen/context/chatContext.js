import React,{createContext, useState} from "react"

export const RowsOfMessagesToUpdate = createContext();

export const ChatUpdates = ( {children} ) => {

    const [updates, setUpdates] = useState({});

    return <RowsOfMessagesToUpdate.Provider 
                value = {{
                        updates,
                        addNewUpdate
                        }} >
                    {children}
           </RowsOfMessagesToUpdate.Provider>

    function addNewUpdate(contactUid,row,state){
        let newUpdates = {};
        Object.assign(newUpdates,updates);
        //se non esiste ancora nessun update per la chat con quel contatto, creo la lista
        if(newUpdates[contactUid]==undefined)
            newUpdates[contactUid] = {};
        newUpdates[contactUid][row] = state;
        setUpdates(newUpdates);
    }
}