import * as React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import { FAB, Portal, Provider } from 'react-native-paper';
import { altezzaDevice, larghezzaDevice} from '../../../../../context/variabili_globali/variabiliGlobali';
import { MosCeleste, MosViola } from '../../../../../resources/colors';
import i18n from 'i18n-js';

const VisibilityFAB = (props) => {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
      <>
          
    <Provider style={{backgroundColor:"green"}} >
      <Portal >
        <FAB.Group
          style={{paddingBottom:70, }}
          fabStyle={{color:"yellow", backgroundColor:"white"}}
          open={open}
          icon={open ? 'eye-outline' : 'eye'}
          color={MosCeleste}
          actions={[
            { icon: 'eye',label: i18n.t('discoverHowOthersSeeYourProfile'), onPress: () => console.log('Pressed add') },
              {
                icon: 'circle-outline',
                label: i18n.t('minimumVisibility'),
                color: props.visibility=="100"?MosViola:"grey",
                onPress: () => props.setVisibility("100"),
              },
/*              {
                icon: 'circle-slice-2',
                label: '25% di visibilità',
                color: props.visibility=="75"?MosViola:"grey",
                onPress: () => props.setVisibility("75"),
              },
*/
              {
                icon: 'circle-slice-4',
                label: i18n.t('mediumVisibility'),
                color: props.visibility=="50"?MosViola:"grey",
                onPress: () => props.setVisibility("50"),
              },
/*
            {
              icon: 'circle-slice-6',
              label: '75% di visibilità',
              color: props.visibility=="25"?MosViola:"grey",
              onPress: () => props.setVisibility("25"),
            },
*/
            {
              icon: 'circle-slice-8',
              label: i18n.t('maximumVisibility'),
              color: props.visibility=="0"?MosViola:"grey",
              onPress: () => props.setVisibility("0"),
              small: false,
            },
          ]}
          
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
           
      </Portal>
    </Provider>
    </>
  );
};

export default VisibilityFAB;

const styles = StyleSheet.create({
    bottoneAggiungiFoto: {
        position: 'absolute',
        backgroundColor:"white",
        left:15,
        bottom:15,
        ...Platform.select({
            android: {
                elevation:10
            }
        })
      },
})

/*<FAB
style={styles.bottoneAggiungiFoto}
small
icon="eye"
color={MosCeleste}
onPress={()=>console.log("apro")}/>*/