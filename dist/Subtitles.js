"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const vtt_to_json_1 = __importDefault(require("vtt-to-json"));
var { default: srtParser2 } = require('srt-parser-2');
const timeToSeconds = (seconds) => {
    var time = seconds.split(':');
    return +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
};
const Subtitles = ({ selectedSubtitle, currentTime, hasSeeked, containerStyle = {}, textStyle = {}, }) => {
    const [subtitles, setSubtitles] = (0, react_1.useState)(null);
    const [text, setText] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const subtitleType = selectedSubtitle.file.split('.')[selectedSubtitle.file.split('.').length - 1];
        fetch(selectedSubtitle.file).then((response) => {
            console.log({ response });
            const openedSubtitle = response;
            if (subtitleType === 'srt') {
                var parser = new srtParser2();
                const parsedSubtitle = parser.fromSrt(openedSubtitle);
                let result = [];
                parsedSubtitle.map((subtitle) => {
                    result.push({
                        start: timeToSeconds(subtitle.startTime.split(',')[0]),
                        end: timeToSeconds(subtitle.endTime.split(',')[0]),
                        part: subtitle.text,
                    });
                });
                setSubtitles(result);
            }
            else if (subtitleType === 'vtt') {
                (0, vtt_to_json_1.default)(openedSubtitle).then((parsedSubtitle) => {
                    let result = [];
                    parsedSubtitle.map((subtitle) => {
                        // For some reason this library adds the index of the subtitle at the end of the part, so we cut it
                        result.push({
                            start: subtitle.start / 1000,
                            end: subtitle.end / 1000,
                            part: subtitle.part.slice(0, subtitle.part.length -
                                subtitle.part.split(' ')[subtitle.part.split(' ').length - 1]
                                    .length),
                        });
                    });
                    setSubtitles(result);
                });
            }
        });
    }, [selectedSubtitle, hasSeeked]);
    (0, react_1.useEffect)(() => {
        if (subtitles) {
            let videoTime = Math.floor(currentTime);
            for (let index = 0; index < subtitles.length; index++) {
                const subtitle = subtitles[index];
                if (videoTime >= subtitle.end) {
                    let subtitlesCopy = subtitles;
                    subtitlesCopy.shift();
                    setSubtitles(subtitlesCopy);
                }
            }
            if (subtitles[0]) {
                let currentSubtitleStart = subtitles[0].start;
                let currentSubtitleEnd = subtitles[0].end;
                let currentSubtitleText = subtitles[0].part;
                if (currentSubtitleStart + 4 < currentSubtitleEnd) {
                    currentSubtitleEnd = currentSubtitleStart + 4;
                }
                if (videoTime >= currentSubtitleStart) {
                    setText(currentSubtitleText);
                }
                if (videoTime >= currentSubtitleEnd) {
                    setText('');
                    let subtitlesCopy = subtitles;
                    subtitlesCopy.shift();
                    setSubtitles(subtitlesCopy);
                }
            }
        }
    }, [currentTime, subtitles]);
    (0, react_1.useEffect)(() => {
        setText('');
    }, [hasSeeked]);
    return (<react_native_1.View style={Object.assign(Object.assign({}, containerStyle), { marginBottom: '5%' })}>
      {text.length > 0 ? (<react_native_1.Text style={Object.assign({ fontSize: 25, color: 'white', textAlign: 'center', alignSelf: 'center', padding: 25, backgroundColor: 'rgba(0,0,0,.6)', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2 }, textStyle)}>
          {text}
        </react_native_1.Text>) : null}
    </react_native_1.View>);
};
exports.default = Subtitles;
