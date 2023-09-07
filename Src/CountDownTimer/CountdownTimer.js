import React from 'react';
import DateTimeDisplay from './DateTimeDisplay';
import { useCountdown } from './useCountdown';
import { View,Text } from 'react-native';

const ExpiredNotice = () => {
  return (
    <View>
      <Text>Expired!!!</Text>
      <Text>Please select a future date and time.</Text>
    </View>
  );
};

const ShowCounter = ({ days, hours, minutes, seconds }) => {
  return (
    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
      <DateTimeDisplay value={days} type={'Days'} isDanger={days <= 3} />
      <Text style={{paddingVertical: 5}}>:</Text>
      <DateTimeDisplay value={hours} type={'Hours'} isDanger={false} />
      <Text style={{paddingVertical: 5}}>:</Text>
      <DateTimeDisplay value={minutes} type={'Mins'} isDanger={false} />
      <Text style={{paddingVertical: 5}}>:</Text>
      <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={false} />
    </View>
  );
};

const CountdownTimer = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />;
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};

export default CountdownTimer;
