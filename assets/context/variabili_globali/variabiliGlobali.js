import React, {useState, createContext} from "react";
import {Dimensions, StatusBar} from "react-native";

//colore barra di stato
export const ColoreBarraDiStato = createContext("#fff");
export const ColoreBarraDiStatoProvider = ({children}) => {
    const [colore, setColore] = useState("#fff");

    return <ColoreBarraDiStato.Provider
                value= {{
                    colore,
                    setColore
                }}
            >
                {children}
           </ColoreBarraDiStato.Provider>
}

//altezza device
export const altezzaDevice = Dimensions.get("window").height;
//larghezza
export const larghezzaDevice = Dimensions.get("window").width;
export const fontUnit = Dimensions.get("window").height*0.016;
//altezza schermo interno
export const altezzaSchermoInterno = (Dimensions.get("window").height-StatusBar.currentHeight);
//dimensioni font predefinite
export const fontSizeTitolo = Dimensions.get("window").height*0.06;
export const fontSizeTitoloPiccolo = Dimensions.get("window").height*0.04;
export const fontSizeSottoTitolo = Dimensions.get("window").height*0.03;
export const fontSizeCampi = Dimensions.get("window").height*0.02;
//dimensioni icona torna indietro
export const iconSize = Dimensions.get("window").width*0.07;
//dimensioni menu di navigazione
export const navbarHeight = 49;