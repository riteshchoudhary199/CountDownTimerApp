import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  TextInput,
  Alert,
} from 'react-native';
import {Colors, Images, Icons, FontFamily, CommonStyles} from '../../Styles';
import {
  scale,
  verticalScale,
  moderateScaleVertical,
  moderateScale,
  height,
} from '../../Styles/ResponsiveSize';
import {ImageEnum, keyboardTypeEnum} from '../../Constants/Enum';
import strings, {changingLanguage} from '../../Constants/Lang';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  CustomWhiteTextInput,
  CustomButton,
  CustomLoader,
} from '../../Components';
import Actions from '../../Redux/Actions';
import {showError, showSuccess} from '../../Utility/Helper';
import LinearGradient from 'react-native-linear-gradient';
import CountryFlag from 'react-native-country-flag';
import {Dropdown} from 'react-native-element-dropdown';
import {useSelector} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import {CountryPicker} from 'react-native-country-codes-picker';

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? scale(66) : scale(78);

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, {backgroundColor}]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);
function EditProfile({navigation, ...props}) {
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const userNameRef = useRef('');
  const [userName, setUserName] = useState('');
  const emailRef = useRef('');
  const [email, setEmail] = useState('');
  const [countryFlag, setCountryFlag] = useState('DE');
  const mobileNumberRef = useRef('');
  const phoneInput = useRef('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureData, setProfilePictureData] = useState('');
  const [selectedlanguage, setSelectedLanguage] = useState(null);
  const [languageKey, setLanguageKey] = useState(null);
  const {language} = useSelector(state => state?.home);
  const languageArray = [
    {label: strings.English, value: 'ENGLISH', languageKey: 'en'},
    {label: strings.German, value: 'GERMAN', languageKey: 'de'},
  ];
  const [showCountryCodeDropDown, setShowCountryCodeDropDown] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      getProfileData();
      setLanguageKey(language);
    });
    const getProfileData = () => {
      Actions.UserProfileDetails()
        .then(resp => {
          if (resp?.status == 200) {
            setLoading(false);
            setUserDetails(resp?.data);
            emailRef.current = resp?.data?.email;
            setEmail(resp?.data?.email);
            setFirstName(resp?.data?.first_name);
            setLastName(resp?.data?.last_name);
            userNameRef.current = resp?.data?.user_name;
            setUserName(resp?.data?.user_name);
            mobileNumberRef.current = resp?.data?.phone_number;
            setCountryCode(resp?.data?.country_code);
            if (resp?.data?.phone_number.startsWith(resp?.data?.country_code)) {
              let phoneNumber = resp?.data?.phone_number?.slice(
                resp?.data?.country_code?.length,
              );
              setMobileNumber(phoneNumber);
            }
            setCountryFlag(resp?.data?.country_flag);
            setProfilePictureData(resp?.data?.profile_pic);
            setSelectedLanguage(resp?.data?.language);
          }
        })
        .catch(error => {
          console.log('catch error in Profile Data', error);
          setLoading(false);
          if (error?.error == 'Network Error') {
            showError('Connection error..!!');
          }
          showError(error?.error);
        });
    };
    return unsubscribe;
  }, [navigation]);

  const onBackIconPress = () => {
    navigation.goBack();
  };

  const onSaveButtonPress = () => {
    setLoading(true);
    changingLanguage(languageKey);
    const formData = new FormData();
    if (profilePicture) {
      formData.append('profile_pic', {
        type: profilePicture?.mime,
        uri: profilePicture?.path,
        name: profilePicture?.path?.split('/')?.pop(),
      });
    } else {
      formData.append('profile_pic', '');
    }
    let phoneNumber = countryCode + mobileNumber;
    formData.append('userId', userDetails?._id);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    userNameRef.current != userName && formData.append('user_name', userName);
    emailRef.current != email && formData.append('email', email);
    mobileNumberRef.current != phoneNumber &&
      formData.append('phone_number', phoneNumber);
    formData.append('language', selectedlanguage);
    formData.append('country_flag', countryFlag);
    formData.append('country_code', countryCode);
    Actions.deleteAccount(formData)
      .then(res => {
        showSuccess(res?.message);
        setLoading(false);
        navigation.goBack();
      })
      .catch(error => {
        console.log('error of in updating user details', error);
        setLoading(false);

        if (error?.error == 'Network Error') {
          showError('Connection error..!!');
        }
        showError(error?.error);
      });
  };

  const chooseImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      // includeBase64: true
    })
      .then(image => {
        setProfilePicture(image);
        setProfilePictureData(image.path);
        props.onChange?.(image);
      })
      .catch(err => {
        console.log(err, 'err =');
      });
  };

  const openCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        setProfilePicture(image);
        setProfilePictureData(image.path);
      })
      .catch(err => {
        console.log(err, 'err =');
      });
  };

  const OpenCameraAlert = async props => {
    Alert.alert(
      'Choose Image',
      '',
      [
        {
          text: 'Open Camera',
          onPress: () => {
            openCamera();
          },
        },
        {
          text: 'Open Gallery',
          onPress: () => {
            chooseImage();
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const renderDropDownItems = item => {
    return (
      <View style={styles.dropDownItem}>
        <Text style={[styles.dropDownTxt, {color: Colors.black}]}>
          {item.label}
        </Text>
      </View>
    );
  };
  const rightIcon = () => {
    <Image source={Icons.dropDownIcon} style={styles.dropDownIcon} />;
  };

  const onCountryCodeSelect = country => {
    let countryCodeWithoutPlus = country?.dial_code?.replace('+', '');
    setCountryCode(countryCodeWithoutPlus);
    setCountryFlag(country.code);
    setShowCountryCodeDropDown(false);
  };

  const handlePhoneNumberChange = value => {
    setMobileNumber(value);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header Component */}
      <MyStatusBar
        backgroundColor={Colors.headerBackground}
        barStyle="light-content"
      />
      <View style={styles.headerContainer}>
        <View style={styles.headerContentContainer}>
          <TouchableOpacity
            style={styles.backBtnContainer}
            activeOpacity={0.7}
            onPress={() => onBackIconPress()}>
            <Image source={Icons.backIcon} style={styles.backBtnStyle} />
          </TouchableOpacity>
          <Text style={styles.headerTextStyle}>{strings.Edit_Profile}</Text>
        </View>
      </View>
      {/* Main Screen Container */}
      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always">
        {/* User Profile Section */}
        <View style={styles.userProfileContainer}>
          <ImageBackground
            source={
              profilePictureData
                ? {uri: profilePictureData}
                : Images.profilePicture
            }
            style={styles.profileIcon}
            imageStyle={{
              borderRadius: moderateScaleVertical(50),
              resizeMode: ImageEnum.contain,
            }}>
            <TouchableOpacity
              style={styles.editIconContainer}
              activeOpacity={0.7}
              onPress={OpenCameraAlert}>
              <Image source={Icons.editIcon} style={styles.editIconStyle} />
            </TouchableOpacity>
          </ImageBackground>
        </View>
        {/* Form Section */}
        <CustomWhiteTextInput
          inputHeading={strings.FirstName}
          titleStyle={styles.inputHeading}
          placeholder={strings.FistName_PlaceHolder}
          inputContainerStyle={[styles.inputContainer, styles.inputTextStyle]}
          value={firstName}
          onChangeText={value => setFirstName(value)}
        />

        <CustomWhiteTextInput
          inputHeading={strings.LastName}
          titleStyle={styles.inputHeading}
          placeholder={strings.LastName_PlaceHolder}
          inputContainerStyle={[styles.inputContainer, styles.inputTextStyle]}
          value={lastName}
          onChangeText={value => setLastName(value)}
        />
        <CustomWhiteTextInput
          inputHeading={strings.Email_SignUp}
          titleStyle={styles.inputHeading}
          placeholder={strings.Email_PlaceHolder}
          inputContainerStyle={[styles.inputContainer, styles.inputTextStyle]}
          value={email}
          onChangeText={value => setEmail(value)}
        />
        <CustomWhiteTextInput
          inputHeading={strings.UserName}
          titleStyle={styles.inputHeading}
          placeholder={strings.UserName_PlaceHolder}
          inputContainerStyle={[styles.inputContainer, styles.inputTextStyle]}
          value={userName}
          onChangeText={value => setUserName(value)}
        />
        <View>
          <Text style={styles.inputHeading}>{strings.Phone_Number}</Text>

          <View
            style={{
              ...styles.inputContainer,
              ...styles.rowAlignedView,
              ...styles.phoneContainer,
            }}>
            <View style={styles.countryCodeDropDownContainer}>
              <TouchableOpacity
                onPress={() => {
                  setShowCountryCodeDropDown(true);
                }}
                style={styles.rowAlignedView}>
                <LinearGradient
                  colors={[
                    Colors.gradientDark,
                    Colors.gradientMedium,
                    Colors.gradientLight,
                  ]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientView}>
                  <View style={styles.flagContainer}>
                    <CountryFlag
                      isoCode={countryFlag ?? 'DE'}
                      size={scale(20)}
                      style={[CommonStyles.mainContainer]}
                    />
                  </View>
                </LinearGradient>

                <Image
                  source={Icons.dropDownIcon}
                  style={styles.dropDownIconStyle}
                />
              </TouchableOpacity>
              {!!showCountryCodeDropDown && (
                <CountryPicker
                  show={showCountryCodeDropDown}
                  onBackdropPress={() => {
                    setShowCountryCodeDropDown(false);
                  }}
                  pickerButtonOnPress={item => onCountryCodeSelect(item)}
                  style={{modal: styles.countrySelectorModal}}
                />
              )}

              <View style={styles.lineSepratator} />
            </View>
            <View style={styles.phoneInputStyle}>
              <TextInput
                style={{
                  ...styles.inputHeading,
                  ...styles.inputTextStyle,
                  marginRight: verticalScale(6),
                }}
                placeholder={strings.Country_Code}
                placeholderTextColor={Colors.profileGray}
                value={`+${countryCode}`}
                editable={false}
              />
              <TextInput
                style={{
                  ...styles.inputHeading,
                  ...styles.inputTextStyle,
                }}
                placeholder={strings.PhoneNumber_PlaceHolder}
                placeholderTextColor={Colors.profileGray}
                value={mobileNumber}
                keyboardType={keyboardTypeEnum.phonePad}
                maxLength={12}
                onChangeText={handlePhoneNumberChange}
              />
            </View>
          </View>
        </View>
        <View>
          <Text style={styles.inputHeading}>{strings.Language}</Text>
          <View
            style={{
              ...styles.inputContainer,
              ...styles.rowAlignedView,
              ...styles.phoneContainer,
            }}>
            <Dropdown
              style={styles.dropDownContainer}
              containerStyle={styles.shadow}
              data={languageArray}
              labelField="label"
              valueField="value"
              label="Dropdown"
              placeholder={strings.Language_PlaceHolder}
              value={selectedlanguage}
              renderRightIcon={rightIcon()}
              onChange={item => {
                setSelectedLanguage(item.value);
                setLanguageKey(item?.languageKey);
              }}
              renderItem={item => renderDropDownItems(item)}
              textError="Error"
              selectedTextStyle={styles.dropDownTxt}
              placeholderStyle={styles.dropDownTxt}
            />
          </View>
        </View>
        <CustomButton
          title={strings.Save_Profile}
          containerStyle={styles.btnStyle}
          onPress={() => {
            if (profilePicture || profilePictureData) {
              onSaveButtonPress();
            } else {
              showError('Please Select Image');
            }
          }}
        />
        {loading && <CustomLoader />}
      </KeyboardAwareScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    height: APPBAR_HEIGHT,
    justifyContent: 'flex-end',
    paddingHorizontal: verticalScale(20),
    backgroundColor: Colors.headerBackground,
    borderBottomColor: Colors.white,
    borderBottomWidth: moderateScaleVertical(0.3),
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  backBtnStyle: {
    width: scale(16),
    height: scale(16),
    resizeMode: ImageEnum.contain,
  },
  backBtnContainer: {
    paddingRight: moderateScaleVertical(14),
    paddingVertical: moderateScaleVertical(8),
  },
  headerContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextStyle: {
    fontFamily: FontFamily.medium,
    color: Colors.white,
    fontSize: moderateScale(20),
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: moderateScaleVertical(20),
    marginBottom: moderateScaleVertical(10),
  },
  profileIcon: {
    height: scale(100),
    width: scale(100),
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inputHeading: {
    fontFamily: FontFamily.medium,
    fontSize: moderateScale(14),
    color: Colors.profileGray,
  },
  phoneContainer: {
    borderWidth: moderateScaleVertical(1),
    borderColor: Colors.whiteGray,
    marginBottom: moderateScaleVertical(20),
    paddingHorizontal: 0,
  },
  gradientView: {
    borderRadius: moderateScaleVertical(18),
    height: moderateScaleVertical(32),
    width: moderateScale(32),
  },
  rowAlignedView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnStyle: {
    marginBottom: moderateScaleVertical(10),
  },
  inputContainer: {
    borderRadius: moderateScaleVertical(14),
    height: scale(54),
    paddingHorizontal: moderateScaleVertical(20),
  },
  inputTextStyle: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.semiBold,
    color: Colors.white,
  },
  countryCodeDropDownContainer: {
    flex: 2,
    flexDirection: 'row',
  },
  dropDownIconStyle: {
    height: scale(10),
    width: scale(10),
    resizeMode: ImageEnum.contain,
    marginLeft: moderateScaleVertical(4),
  },
  lineSepratator: {
    borderWidth: moderateScaleVertical(1),
    borderRightColor: Colors.whiteshGray,
    marginRight: moderateScaleVertical(8),
  },
  flagContainer: {
    flex: 1,
    margin: moderateScaleVertical(1),
    borderRadius: moderateScaleVertical(18),
    overflow: 'hidden',
  },
  userProfileContainer: {
    alignItems: 'center',
    marginBottom: moderateScaleVertical(30),
    marginTop: moderateScaleVertical(15),
  },
  editIconContainer: {
    backgroundColor: Colors.yellow,
    borderRadius: moderateScaleVertical(18),
    alignItems: 'center',
    marginTop: scale(12),
    height: scale(34),
    width: scale(34),
    justifyContent: 'center',
  },
  editIconStyle: {
    height: scale(18.25),
    width: scale(18.25),
    resizeMode: ImageEnum.contain,
  },
  phoneInputStyle: {
    flex: 7,
    flexDirection: 'row',
  },
  dropDownContainer: {
    width: '100%',
    color: Colors.white,
    zIndex: 100,
    paddingHorizontal: moderateScaleVertical(20),
  },
  shadow: {
    shadowColor: Colors.lightGreyTxt,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  dropDownItem: {
    paddingVertical: moderateScaleVertical(17),
    paddingHorizontal: moderateScaleVertical(4),
  },
  dropDownTxt: {
    color: Colors.white,
    fontSize: moderateScale(15),
    fontFamily: FontFamily.semiBold,
  },
  dropDownIcon: {
    height: scale(10),
    width: scale(10),
    resizeMode: ImageEnum.contain,
  },
  countrySelectorModal: {
    height: Platform.OS == 'ios' ? height / 1.5 : height / 2,
  },
});
export default EditProfile;
