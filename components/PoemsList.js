import React, { Component } from 'react';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import Modal from 'react-native-modal';
import ModalMenu from './ModalMenu';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Linking,
  Image,
  Alert,
  CameraRoll,
  LayoutAnimation,
  ScrollView
} from 'react-native';
import {
  Icon,
  Container,
  Content,
  Right,
  Title,
  Subtitle,
  Button,
  Body,
  CardItem,
  Card,
  Left,
  Row,
  Col,
  ActionSheet
} from 'native-base';
import axios from 'axios';
import moment from 'moment';

export default class PoemsList extends Component {
  static navigationOptions = {
    headerStyle: {
      height: 80,
      elevation: 0, //remove shadow on Android
      shadowOpacity: 0, //remove shadow on iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      borderRadius: 5,
      backgroundColor: '#fff',
      paddingBottom: 5
    },
    headerTintColor: 'black',
    headerTitle: (
      <View style={{ width: '100%' }}>
        <Title
          style={{ fontFamily: 'Streamster', fontSize: 35, color: '#000' }}
        >
          Dis Net Jy
        </Title>
        <Subtitle
          style={{
            fontFamily: 'Proxima Nova Alt',
            fontSize: 16,
            color: '#000'
          }}
        >
          KLYNTJI
        </Subtitle>
      </View>
    )
  };
  state = {
    isModalVisible: false,
    poems: [],
    loading: true,
    res: '',
    value: {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      snapshotContentContainer: false
    }
  };
  componentWillUpdate() {
    LayoutAnimation.configureNext({
      duration: 50,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut }
    });
  }
  Report = item => {
    const repotedPoem = {
      name: item.name,
      body: item.body,
      handle: item.handle
    };
    axios
      .post(`http://www.disnetjy.com/api/send`, repotedPoem)
      .then(res => res.data);
    alert('Poem Reported, we will review.');
  };
  componentWillMount() {
    axios.get(`http://www.disnetjy.com/api/poems`).then(res =>
      this.setState({
        poems: res.data,
        loading: false
      })
    );
  }
  snapshot = refname => () => {
    captureRef(this[refname], this.state.value)
      .then(res =>
        this.setState({
          error: null,
          res,
          previewSource: {
            uri:
              this.state.value.result === 'base64'
                ? 'data:image/' + this.state.value.format + ';base64,' + res
                : res
          }
        })
      )
      .then(
        this.share()
        // CameraRoll.saveToCameraRoll(this.state.res).then(
        //   Alert.alert('Success', 'Photo added to camera roll!')
        // )
      )

      .catch(error => this.setState({ error, res: null, previewSource: null }));
  };
  share = () => {
    setTimeout(
      function() {
        const image = this.state.res;
        RNFetchBlob.fs.readFile(image, 'base64').then(data => {
          let shareOptions = {
            title: 'React Native Share Example',
            message: 'Check out this photo!',
            url: `data:image/jpg;base64,${data}`,
            subject: 'Check out this photo!'
          };
          Share.open(shareOptions)
            .then(res => console.log('res:', res))
            .catch(err => console.log('err', err));
        });
        this.setState({ meter: true });
      }.bind(this),
      500
    );
  };
  render() {
    var now = 1;
    return (
      <Container>
        <View
          style={styles.container}
          collapsable={false}
          showsHorizontalScrollIndicator={false}
        >
          {this.state.loading ? (
            <Image
              style={{
                flex: 1,
                width: '50%'
              }}
              resizeMode={'contain'}
              source={require('../assets/LOAD.gif')}
            />
          ) : (
            <View
              style={{
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 20,
                flex: 1
              }}
            >
              <FlatList
                onContentSizeChange={(w, h) => (this.contentHeight = h)}
                onLayout={ev =>
                  (this.scrollViewHeight = ev.nativeEvent.layout.height)
                }
                pagingEnabled={true}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={this.state.poems}
                horizontal={true}
                collapsable={false}
                ref="full"
                renderItem={({ item, i }) => (
                  <ScrollView
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.flatview}
                  >
                    <Card
                      ref={ref => {
                        this[`textInput${item._id}`] = ref;
                      }}
                      transparent
                      bordered={false}
                      style={{
                        paddingBottom: 30,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        borderRadius: 5
                      }}
                    >
                      <CardItem>
                        <Body>
                          <Row>
                            <Col>
                              <Text style={styles.name}>{item.name}</Text>
                              {item.handle ? (
                                <Text
                                  onPress={() =>
                                    Linking.openURL(
                                      `https://www.instagram.com/${item.handle}`
                                    )
                                  }
                                  style={styles.handle}
                                >
                                  <Icon
                                    style={styles.icon}
                                    type="FontAwesome"
                                    name="instagram"
                                  />{' '}
                                  {item.handle}
                                </Text>
                              ) : null}
                            </Col>
                            <Col style={{ width: 20 }}>
                              <ModalMenu poem={item} />
                            </Col>
                          </Row>
                          <Text style={styles.body}>{item.body}</Text>
                          <Row>
                            <Col>
                              <View>
                                <Text style={styles.date}>
                                  {moment(item.date).fromNow()}
                                </Text>
                              </View>
                            </Col>
                          </Row>
                          <Text
                            onPress={this.Report.bind(this, item)}
                            style={styles.date}
                          >
                            Report
                          </Text>
                          {/* <Button
                              collapsable={false}
                              onPress={this.snapshot(`textInput${item._id}`)}
                              style={styles.date}
                            >
                              <Text>Save To Camera</Text>
                            </Button> */}
                        </Body>
                      </CardItem>
                    </Card>
                  </ScrollView>
                )}
                keyExtractor={item => item._id}
              />
            </View>
            // </Content>
          )}
        </View>
      </Container>
    );
  }
}
let screenWidth = Dimensions.get('window').width - 20;
let screenHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flatview: {
    width: screenWidth,
    backgroundColor: '#fff',
    color: '#000',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 30
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // borderRadius: 5
  },
  name: {
    fontFamily: 'Proxima Nova Alt',
    fontSize: 30,
    textAlign: 'left'
    // paddingTop: 30
  },
  handle: {
    fontFamily: 'Proxima Nova Alt',
    fontSize: 16,
    textAlign: 'left'
    // paddingBottom: 10
  },
  body: {
    fontFamily: 'Lato-Light',
    fontSize: 18,
    paddingBottom: 10,
    paddingTop: 30
  },
  icon: {
    fontSize: 14
  },
  date: {
    fontFamily: 'Lato-Light',
    fontSize: 12,
    textAlign: 'right',
    color: '#DCDCDC'
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    borderRadius: 5
  }
});
