import React from 'react';
import PropTypes from 'prop-types';
import {
    Image,
    InteractionManager,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import Immutable from 'immutable';
import tinycolor from 'tinycolor2';
import {
    createPanResponder,
} from './utils';
import {
    BitMap,
} from 'glaciall-bitmap';

export class BitMapColorPicker extends React.Component {

    constructor(props, ctx) {
        super(props, ctx);
        this.bmp = new BitMap();
        this.bmp.fromBase64(props.base64Bmp.replace(/^data:image\/bmp;base64,/, ''));
        this.bmpRgbRect = this.bmp.getRgbRect();
        this.bmpPickerWidthRatio = 1;
        this.bmpPickerHeightRatio = 1;

        const state = {
            color: '#FA0100',
            pickerWidth: null,
            pickerHeight: null,
            pickerX: null,
            pickerY: null,
        };
        if (props.oldColor) {
            state.color = tinycolor(props.oldColor).toHexString();
        }
        if (props.defaultColor) {
            state.color = tinycolor(props.defaultColor).toHexString();
        }
        this.state = state;
        this._layout = {
            width: 0,
            height: 0,
            x: 0,
            y: 0,
        };
        this._pageX = 0;
        this._pageY = 0;
        this._onLayout = this._onLayout.bind(this);
    }


    static propTypes = {
        color: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                h: PropTypes.number,
                s: PropTypes.number,
                v: PropTypes.number
            }),
        ]),
        defaultColor: PropTypes.string,
        oldColor: PropTypes.string,
        onColorChange: PropTypes.func,
        /**
         * The bitmap palette base64 string, comes from some base64 convert tool against a bmp.
         */
        base64Bmp: PropTypes.string,
    };

    static defaultProps = {
        base64Bmp: require('./colour-wheel-1740381_300.js').default,
    };

    shouldComponentUpdate(nextProps, nextState = {}) {
        return !Immutable.is(Immutable.fromJS(this.props), Immutable.fromJS(nextProps))
        || !Immutable.is(Immutable.fromJS(this.state), Immutable.fromJS(nextState));
    }

    getColor() {
        const passedColor = typeof this.props.color === 'string' ?
            this.props.color :
            tinycolor(this.props.color).toHexString();
        return passedColor || this.state.color;
    }

    setOldColor = oldColor => {
        let color = tinycolor(oldColor).toRgb();
        color = (color.r << 16) | (color.g << 8) | color.b;
        let found = false;
        let pickerX = 0;
        let pickerY = 0;
        for (let bmpY = 0; bmpY < this.bmp.height; bmpY++) {
            pickerY = bmpY;
            for (let bmpX = 0; bmpX < this.bmp.width; bmpX++) {
                if (color === this.bmpRgbRect[bmpY][bmpX]) {
                    pickerX = bmpX;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        pickerX = parseInt(pickerX / this.bmpPickerWidthRatio, 10);
        pickerY = parseInt(pickerY / this.bmpPickerHeightRatio, 10);

        this.setState({
            pickerX,
            pickerY,
        });
    }

    _onColorChange({
        pickerX,
        pickerY,
    }, resType) {
        const bmpX = parseInt(pickerX * this.bmpPickerWidthRatio, 10);
        const bmpY = parseInt(pickerY * this.bmpPickerHeightRatio, 10);
        let color = this.bmp.rgbToHexString(this.bmpRgbRect[bmpY][bmpX]);
        this.setState({
            pickerX,
            pickerY,
            color,
        });

        if (this.props.onColorChange) {
            this.props.onColorChange(color, resType);
        }
    }

    measurePickerContainer() {
        // we always measure because layout is the same even though picker is moved on the page
        InteractionManager.runAfterInteractions(() => {
            // measure only after (possible) animation ended
            this.pickerContainer && this.pickerContainer.measureInWindow((pageX, pageY, width, height ) => {
                // picker position in the screen
                this._pageX = pageX;
                this._pageY = pageY;
            });
        });
    }

    _onLayout(l) {
        this._layout = l.nativeEvent.layout;
        const {
            width,
            height,
        } = this._layout;

        if (this.state.pickerWidth !== width || this.state.pickerHeight !== height) {
            this.bmpPickerWidthRatio = this.bmp.width / width;
            this.bmpPickerHeightRatio = this.bmp.height / height;

            let color = tinycolor(this.props.oldColor || this.props.defaultColor || '#FA0100').toRgb();
            color = (color.r << 16) | (color.g << 8) | color.b;
            let found = false;
            let pickerX = 0;
            let pickerY = 0;
            for (let bmpY = 0; bmpY < this.bmp.height; bmpY++) {
                pickerY = bmpY;
                for (let bmpX = 0; bmpX < this.bmp.width; bmpX++) {
                    if (color === this.bmpRgbRect[bmpY][bmpX]) {
                        pickerX = bmpX;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
            pickerX = parseInt(pickerX / this.bmpPickerWidthRatio, 10);
            pickerY = parseInt(pickerY / this.bmpPickerHeightRatio, 10);

            this.setState({
                pickerWidth: width,
                pickerHeight: height,
                pickerX,
                pickerY,
            });
        }

        if (Platform.OS !== 'web') {
            this.measurePickerContainer();
        }
    }

    componentWillMount() {
        const handleColorChange = ({
            x,
            y
        }, evt, state, resType) => {
            let pickerX = parseInt(x - this._pageX, 10);
            pickerX = pickerX > this.state.pickerWidth ? this.state.pickerWidth - 1 : pickerX;
            pickerX = pickerX < 0 ? 0 : pickerX;
            let pickerY = parseInt(y - this._pageY, 10);
            pickerY = pickerY > this.state.pickerHeight ? this.state.pickerHeight - 1 : pickerY;
            pickerY = pickerY < 0 ? 0 : pickerY;
            this._onColorChange({
                pickerX,
                pickerY,
            }, resType);
        };
        this._pickerResponder = createPanResponder({
            onStart: handleColorChange,
            onMove: handleColorChange,
            onEnd: handleColorChange,
        });
    }

    componentDidMount() {
        if (Platform.OS === 'web') {
            this.measurePickerContainer();
        }
    }

    refPickerContainer = view => {
        this.pickerContainer = view;
    }

    render() {
        const {
            pickerWidth,
            pickerHeight,
            pickerX,
            pickerY,
        } = this.state;
        const {
            base64Bmp,
            style,
        } = this.props;
        const computed = makeComputedStyles({
            pickerWidth,
            pickerHeight,
            pickerX,
            pickerY,
            indicatorColor: 'black',
        });

        return (
            <View>
                <View onLayout={this._onLayout} ref={this.refPickerContainer} style={[styles.pickerContainer, {width: (style && style.width) || this.bmp.width, height: (style && style.height) || this.bmp.height}]}>
                    {!pickerWidth ? null :
                    <View>
                        <View
                            {...this._pickerResponder.panHandlers}
                            style={[styles.picker, computed.picker]}
                            collapsable={false}
                        >
                            <Image
                                source={{ uri: base64Bmp }}
                                resizeMode="contain"
                                style={[styles.pickerImage]}
                            />
                            <View style={[styles.pickerIndicator, computed.pickerIndicator]} />
                        </View>
                    </View>
                    }
                </View>
            </View>
        );
    }

}

const makeComputedStyles = ({
    indicatorColor,
    pickerWidth,
    pickerHeight,
    pickerX,
    pickerY,
}) => {
    const indicatorPickerRatio = 42 / 510; // computed from picker image
    const indicatorSize = indicatorPickerRatio * pickerWidth;
    const pickerPadding = indicatorSize / 3;
    return {
        picker: {
            // padding: pickerPadding,
            width: pickerWidth,
            height: pickerHeight,
        },
        pickerIndicator: {
            top: pickerY - indicatorSize / 2,
            left: pickerX - indicatorSize / 2,
            width: indicatorSize,
            height: indicatorSize,
            borderRadius: indicatorSize / 2,
            backgroundColor: 'transparent',
            borderColor: indicatorColor,
            borderWidth: 2,
        },
    };
};

const styles = StyleSheet.create({
    pickerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerImage: {
        flex: 1,
        width: null,
        height: null,
    },
    pickerIndicator: {
        position: 'absolute',
        // Shadow only works on iOS.
        // shadowColor: 'black',
        // shadowOpacity: 0.3,
        // shadowOffset: {
        //     width: 3,
        //     height: 3
        // },
        // shadowRadius: 4,

        // This will elevate the view on Android, causing shadow to be drawn.
        // elevation: 5,
    },
});
