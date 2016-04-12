/*
* Rich Text editor
*/
import React from 'react';
import Immutable from 'immutable';
import {Editor, EditorState, RichUtils, convertFromRaw, convertToRaw, ContentState, Entity} from 'draft-js';

const rawContent = {
  "entityMap": {},
  "blocks": [
    {
      "key": "p40s",
      "text": "Heading",
      "type": "header-one",
      "depth": 0,
      "inlineStyleRanges": [
        {
          "offset": 0,
          "length": 7,
          "style": "UNDERLINE"
        },
        {
          "offset": 0,
          "length": 7,
          "style": "BOLD"
        }
      ],
      "entityRanges": []
    },
    {
      "key": "811o3",
      "text": "Sub heading",
      "type": "header-three",
      "depth": 0,
      "inlineStyleRanges": [
        {
          "offset": 0,
          "length": 11,
          "style": "UNDERLINE"
        }
      ],
      "entityRanges": []
    },
    {
      "key": "4vq83",
      "text": "",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "2prok",
      "text": "Nam tristique hendrerit nulla id interdum. Maecenas pretium pretium massa in pharetra. Pellentesque sapien enim, convallis at tincidunt sed; sodales at quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis in arcu in est consectetur porttitor ac ac purus. Etiam auctor eu quam et lacinia. Nullam bibendum mi dui. Vivamus eu placerat ipsum. Maecenas rutrum venenatis velit nec ultrices. Sed imperdiet malesuada molestie. Duis sagittis ultrices tempor. Pellentesque varius nunc sit amet dui congue, ",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "3qche",
      "text": "",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "480pg",
      "text": "",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "ea80v",
      "text": "Praesent ac eleifend velit",
      "type": "ordered-list-item",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "c4rln",
      "text": "Pellentesque varius nunc sit amet dui congue",
      "type": "ordered-list-item",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "9s285",
      "text": "at ornare mi sagittis!",
      "type": "ordered-list-item",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "4gq7a",
      "text": "",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "ff1i",
      "text": "Phasellus convallis ante dolor, a vehicula massa elementum ut. Nunc vulputate eget ipsum vitae convallis. Maecenas pretium, diam a pulvinar pellentesque, enim ex efficitur mi, nec pretium enim nunc sit amet augue. Nunc varius mi nec rhoncus cursus. Suspendisse et nibh nec purus consectetur lobortis. Interdum et malesuada fames ac ante ipsum primis in faucibus. In rhoncus metus et nisl placerat mattis. Aenean quis facilisis ante! Integer justo enim, blandit a luctus ut, laoreet et odio. Fusce sed augue ante? In massa nunc, feugiat vitae facilisis ut, luctus vitae ipsum. Donec non interdum leo. Praesent bibendum orci a congue fringilla. Maecenas non nulla eget lorem elementum suscipit. Donec cursus egestas nisi ut auctor!",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "bap4u",
      "text": "",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    },
    {
      "key": "a1e4k",
      "text": "",
      "type": "unstyled",
      "depth": 0,
      "inlineStyleRanges": [],
      "entityRanges": []
    }
  ]
};

export default class Texteditor extends React.Component {
    constructor(props) {
        super(props);
        const blocks = convertFromRaw(rawContent);

        this.state = {
            editorState: EditorState.createWithContent(
              ContentState.createFromBlockArray(blocks)
          ),
          noteTitle : ""
        };

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({editorState});

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.handleChange = this.handleChange.bind(this);

        this.logState = () => {
          const content = this.state.editorState.getCurrentContent();
          this.saveNote(convertToRaw(content));
        };
    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
            if (newState) {
                this.onChange(newState);
                return true;
            }
        return false;
    }

    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    handleChange(e){
        this.setState({noteTitle : e.target.value});
    }

    saveNote(data){
        console.log(data);
        console.log(this.state.noteTitle);
    }

    render() {
    const {editorState} = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
          className += ' RichEditor-hidePlaceholder';
        }
    }

    return (
        <div className="row row-clr">
            <div className="note-title-holder col-md-10 col-md-offset-1">
                <p className="edit-note-header">Note title</p>
                <input
                    type="text"
                    value={this.state.noteTitle}
                    name="NoteCategoryName"
                    onChange={this.handleChange.bind(this)}
                    className="pgs-sign-inputs"
                  />
            </div>
            <div className="note-holder">
                <div className="container-fluid">
                    <div className="col-md-10 col-md-offset-1" id="middle-content-wrapper">
                        <div className="RichEditor-root">
                            <BlockStyleControls
                            editorState={editorState}
                            onToggle={this.toggleBlockType}
                            />
                            <InlineStyleControls
                            editorState={editorState}
                            onToggle={this.toggleInlineStyle}
                            />
                            <div className={className} onClick={this.focus}>
                                <Editor
                                blockStyleFn={getBlockStyle}
                                customStyleMap={styleMap}
                                editorState={editorState}
                                handleKeyCommand={this.handleKeyCommand}
                                onChange={this.onChange}
                                placeholder="Write your note..."
                                ref="editor"
                                spellCheck={true}
                                textAlignment = "center"
                                />
                            </div>
                        </div>
                        <input
                            onClick={this.logState}
                            type="button"
                            value="Save Note"
                            className="submit-note-btn"
                            />
                    </div>
                </div>
            </div>
        </div>
    );
    }
}

    // Custom overrides for "code" style.
    const styleMap = {
        CODE: {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
            fontSize: 16,
            padding: 2,
        },
    };

    function getBlockStyle(block) {
        switch (block.getType()) {
            case 'blockquote': return 'RichEditor-blockquote';
            default: return null;
        }
    }

    class StyleButton extends React.Component {
        constructor() {
            super();
            this.onToggle = (e) => {
                e.preventDefault();
                this.props.onToggle(this.props.style);
            };
        }

        render() {
            let className = 'RichEditor-styleButton';
            if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

            return (
                <span className={className} onMouseDown={this.onToggle}>
                {this.props.label}
                </span>
            );
        }
    }

    const BLOCK_TYPES = [
        {label: 'H1', style: 'header-one'},
        {label: 'H2', style: 'header-two'},
        {label: 'H3', style: 'header-three'},
        {label: 'H4', style: 'header-four'},
        {label: 'H5', style: 'header-five'},
        {label: 'H6', style: 'header-six'},
        {label: 'Blockquote', style: 'blockquote'},
        {label: 'UL', style: 'unordered-list-item'},
        {label: 'OL', style: 'ordered-list-item'},
        {label: 'Code Block', style: 'code-block'},
    ];

    const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                key={type.label}
                active={type.style === blockType}
                label={type.label}
                onToggle={props.onToggle}
                style={type.style}
                />
            )}
        </div>
        );
    };

    var INLINE_STYLES = [
        {label: 'Bold', style: 'BOLD'},
        {label: 'Italic', style: 'ITALIC'},
        {label: 'Underline', style: 'UNDERLINE'},
        {label: 'Monospace', style: 'CODE'},
    ];

    const InlineStyleControls = (props) => {
        var currentStyle = props.editorState.getCurrentInlineStyle();
        return (
            <div className="RichEditor-controls">
                {INLINE_STYLES.map(type =>
                    <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                    />
                )}
            </div>
        );
    };
