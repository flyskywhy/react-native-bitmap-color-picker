## react-native-bitmap-color-picker

[![npm version](http://img.shields.io/npm/v/react-native-bitmap-color-picker.svg?style=flat-square)](https://npmjs.org/package/react-native-bitmap-color-picker "View this project on npm")
[![npm downloads](http://img.shields.io/npm/dm/react-native-bitmap-color-picker.svg?style=flat-square)](https://npmjs.org/package/react-native-bitmap-color-picker "View this project on npm")
[![npm licence](http://img.shields.io/npm/l/react-native-bitmap-color-picker.svg?style=flat-square)](https://npmjs.org/package/react-native-bitmap-color-picker "View this project on npm")
[![Platform](https://img.shields.io/badge/platform-ios%20%7C%20android-989898.svg?style=flat-square)](https://npmjs.org/package/react-native-bitmap-color-picker "View this project on npm")

A color picker on a bitmap image palette.

<img src="https://raw.githubusercontent.com/flyskywhy/react-native-bitmap-color-picker/master/Screenshots/basic_android.png" width="375">

PS: The colour wheel picture was published on [Pixabay](https://pixabay.com/illustrations/colour-wheel-spectrum-rainbow-1740381/) by [Pete Linforth](https://pixabay.com/users/TheDigitalArtist-202249/) .

## Install

```shell
npm i --save react-native-bitmap-color-picker
```

## Usage

```jsx
import React from 'react';
import { View } from 'react-native';
import { BitMapColorPicker as ColorPicker } from 'react-native-bitmap-color-picker';

export default class SliderColorPickerExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = { oldColor: "#f77100" };
    }

    componentDidMount() {
        setTimeout(() => this.colorPicker && this.colorPicker.setOldColor('#fde200'), 1000);
    }

    changeColor = (colorRgb, resType) => resType === 'end' && this.setState({ oldColor: colorRgb })

    render() {
        return (
            <View style={{flex: 1, alignItems: 'center'}}>
                <ColorPicker
                    ref={view => {this.colorPicker = view;}}
                    oldColor={this.state.oldColor}
                    onColorChange={this.changeColor}
                    style={{width: 200, height: 200}}/>
            </View>
        );
    }
}
```

## Props

Prop                  | Type     | Optional | Default                   | Description
--------------------- | -------- | -------- | ------------------------- | -----------
oldColor              | [Color string](https://github.com/bgrins/TinyColor#accepted-string-input) | Yes      | undefined                 | Initial positon of the picker indicator
onColorChange         | function | Yes      |                           | Callback continuously called while the user is dragging the picker indicator. The 1st argument is [Color string](https://github.com/bgrins/TinyColor#accepted-string-input). There is 2nd string argument 'end' when the picker indicator is released.
style                 | [style](http://facebook.github.io/react-native/docs/view.html#style)    | Yes      |                           | The style applied to the BitMapColorPicker container
base64Bmp             | string   | Yes      | require('./colour-wheel-1740381_300.js').default | The bitmap palette base64 string, comes from some base64 convert tool against a bmp.

## Methods

    setOldColor(color)

Use this method to change positon of the picker indicator.

## Sponsor

Alipay: flyskywhy@gmail.com

ETH: 0xd02fa2738dcbba988904b5a9ef123f7a957dbb3e
