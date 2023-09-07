import React from 'react';
import { View,Text } from 'react-native';

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <View style={{alignItems:'center',padding:5}}>
      <View>
        <Text>{value}</Text>
      </View>
      <View>
        <Text>{type}</Text>
      </View>
    </View>
  );
};

export default DateTimeDisplay;
