// Import react
import React from 'react'

// Import react-native components
import {
  StyleSheet,
  View,
  Text,
  Image
} from 'react-native'

// Import react-native-svg
// from 'https://github.com/react-native-community/react-native-svg'
import Svg, { Path } from 'react-native-svg'

// Import react-native-size-matters
// from 'https://github.com/nirsky/react-native-size-matters'
import { moderateScale } from 'react-native-size-matters' //installa con: yarn add react-native-size-matters
import { MosCeleste } from '../../../../../../resources/colors'

// Props info list
// 1. mine (bool) => renders blue bubble on right
// 2. text (string) => renders text message
// 3. image (image file) => renders image inside bubble

// Declare component 
function MessageBubble({messaggio}) {
    return (
        <View>
        <View style={[styles.item, styles.itemIn]}>
        <View style={[styles.balloon, {backgroundColor: MosCeleste}]}>
        {/* non preoccuparti per la lunghezza dato che verranno consentiti al massimo solo brevi messaggi*/}
          <Text style={{paddingTop: 5, color: 'white'}}>{messaggio}</Text> 
          <View
          style={[
            styles.arrowContainer,
            styles.arrowLeftContainer,
          ]}
        >

           <Svg style={styles.arrowLeft} width={moderateScale(15.5, 0.6)} height={moderateScale(17.5, 0.6)} viewBox="32.484 17.5 15.515 17.5"  enable-background="new 32.485 17.5 15.515 17.5">
                <Path
                    d="M38.484,17.5c0,8.75,1,13.5-6,17.5C51.484,35,52.484,17.5,38.484,17.5z"
                    fill={MosCeleste}
                    x="0"
                    y="0"
                />
            </Svg>
        </View>
        </View>
      </View>
      </View>
    )
}

export default MessageBubble;

const styles = StyleSheet.create({
item: {
    marginVertical: moderateScale(7, 2),
    flexDirection: 'row'
 },
 itemIn: {
     marginLeft: 20
 },
 itemOut: {
    alignSelf: 'flex-end',
    marginRight: 20
 },
 balloon: {
    maxWidth: moderateScale(250, 2),
    paddingHorizontal: moderateScale(10, 2),
    paddingTop: moderateScale(5, 2),
    paddingBottom: moderateScale(7, 2),
    borderRadius: 20,
 },
 arrowContainer: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: -1,
     flex: 1
 },
 arrowLeftContainer: {
     justifyContent: 'flex-end',
     alignItems: 'flex-start'
 },

 arrowRightContainer: {
     justifyContent: 'flex-end',
     alignItems: 'flex-end',
 },

 arrowLeft: {
     left: moderateScale(-6, 0.5)
 },

 arrowRight: {
     right:moderateScale(-6, 0.5),
 }
})
