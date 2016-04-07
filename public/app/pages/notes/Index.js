/**
 * This is notes index class that handle all
 */
import React from 'react';
import TextField from '../../components/elements/TextField';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import Session from '../../middleware/Session';

const data = [
    {
        "category" : "Business",
        "id" : 1,
        "notes": [
            {
                "title" : "Note title",
                "createdDate" : "04/07/2016",
                "createdTime" : "10.00am",
                "id" : 3,
                "note" : {
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
                        "key": "41quc",
                        "text": "Praesent ac eleifend velit",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "kkog",
                        "text": "Pellentesque varius nunc sit amet dui congue",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "1ugpa",
                        "text": "at ornare mi sagittis!",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "d10fo",
                        "text": "",
                        "type": "unstyled",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "8ud3a",
                        "text": "Aenean turpis lectus, luctus vitae mattis ut, ultricies eu nibh. Duis maximus egestas magna, eu ultrices turpis tincidunt in. Suspendisse potenti. Praesent fringilla metus at dui convallis congue. Sed venenatis magna in sagittis sodales. In vel libero nec enim consequat tincidunt! Nunc tincidunt erat nec congue luctus. Nullam consequat tellus ut felis condimentum tempus. Quisque nec varius libero. Mauris cursus sapien non orci accumsan, ac hendrerit quam elementum.",
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
                }
            },
            {
                "title" : "Note title",
                "createdDate" : "04/07/2016",
                "createdTime" : "10.00am",
                "id" : 4,
                "note" : {
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
                        "key": "41quc",
                        "text": "Praesent ac eleifend velit",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "kkog",
                        "text": "Pellentesque varius nunc sit amet dui congue",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "1ugpa",
                        "text": "at ornare mi sagittis!",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "d10fo",
                        "text": "",
                        "type": "unstyled",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "8ud3a",
                        "text": "Aenean turpis lectus, luctus vitae mattis ut, ultricies eu nibh. Duis maximus egestas magna, eu ultrices turpis tincidunt in. Suspendisse potenti. Praesent fringilla metus at dui convallis congue. Sed venenatis magna in sagittis sodales. In vel libero nec enim consequat tincidunt! Nunc tincidunt erat nec congue luctus. Nullam consequat tellus ut felis condimentum tempus. Quisque nec varius libero. Mauris cursus sapien non orci accumsan, ac hendrerit quam elementum.",
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
                }
            }
        ]
    },
    {
        "category" : "Personal",
        "id" : 2,
        "notes": [
            {
                "title" : "Note title",
                "createdDate" : "04/07/2016",
                "createdTime" : "10.00am",
                "id" : 5,
                "note" : {
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
                        "key": "41quc",
                        "text": "Praesent ac eleifend velit",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "kkog",
                        "text": "Pellentesque varius nunc sit amet dui congue",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "1ugpa",
                        "text": "at ornare mi sagittis!",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "d10fo",
                        "text": "",
                        "type": "unstyled",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "8ud3a",
                        "text": "Aenean turpis lectus, luctus vitae mattis ut, ultricies eu nibh. Duis maximus egestas magna, eu ultrices turpis tincidunt in. Suspendisse potenti. Praesent fringilla metus at dui convallis congue. Sed venenatis magna in sagittis sodales. In vel libero nec enim consequat tincidunt! Nunc tincidunt erat nec congue luctus. Nullam consequat tellus ut felis condimentum tempus. Quisque nec varius libero. Mauris cursus sapien non orci accumsan, ac hendrerit quam elementum.",
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
                }
            },
            {
                "title" : "Note title",
                "createdDate" : "04/07/2016",
                "createdTime" : "10.00am",
                "id" : 6,
                "note" : {
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
                        "key": "41quc",
                        "text": "Praesent ac eleifend velit",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "kkog",
                        "text": "Pellentesque varius nunc sit amet dui congue",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "1ugpa",
                        "text": "at ornare mi sagittis!",
                        "type": "unordered-list-item",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "d10fo",
                        "text": "",
                        "type": "unstyled",
                        "depth": 0,
                        "inlineStyleRanges": [],
                        "entityRanges": []
                      },
                      {
                        "key": "8ud3a",
                        "text": "Aenean turpis lectus, luctus vitae mattis ut, ultricies eu nibh. Duis maximus egestas magna, eu ultrices turpis tincidunt in. Suspendisse potenti. Praesent fringilla metus at dui convallis congue. Sed venenatis magna in sagittis sodales. In vel libero nec enim consequat tincidunt! Nunc tincidunt erat nec congue luctus. Nullam consequat tellus ut felis condimentum tempus. Quisque nec varius libero. Mauris cursus sapien non orci accumsan, ac hendrerit quam elementum.",
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
                }
            }
        ]
    }
]

export default class Index extends React.Component {
    constructor(props) {
        super(props);
        let user =  Session.getSession('prg_lg');
        this.state={
            isShowingModal : false
        }

        this.newCat = {};
    }

    handleClick() {
        this.setState({isShowingModal: true})
    }

    handleClose() {
        this.setState({isShowingModal: false})
    }

    elementChangeHandler(key,data,status){
        console.log(key,data,status);

        this.newCat.category = key;
    }

    addNote(){
        
    }

    getPopup(){
        return(
            <div onClick={this.handleClick}>
                {this.state.isShowingModal &&
                    <ModalContainer onClose={this.handleClose.bind(this)} zIndex={9999}>
                        <ModalDialog onClose={this.handleClose.bind(this)} width="50%" style={{marginTop : "-100px"}}>
                            <h3>Create a new note category.</h3>
                            <TextField  name="NoteCategoryName"
                                        size="12"
                                        value={this.newCat.category}
                                        label="Note category"
                                        placeholder=""
                                        classes="pgs-sign-inputs"
                                        onInputChange={this.elementChangeHandler}
                                        required={false}/>
                            <div className="color-picker">
                                <span className="color tone-one"></span>
                                <span className="color tone-two"></span>
                                <span className="color tone-three"></span>
                                <span className="color tone-four"></span>
                                <span className="color tone-five"></span>
                                <span className="color tone-six"></span>
                            </div>
                            <p className="add-note-cat btn" onClick={this.addNote.bind(this)}>Add note category</p>
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }

    render() {
        return (
            <div className="notesCatHolder container-fluid">
                <div className="row row-clr pg-notes-page-content">
                    <div className="row row-clr pg-notes-page-header">
                        <div className="col-xs-10 col-xs-offset-1">
                            <div className="row">
                                <div className="col-xs-6">
                                    <h2 className="pg-connections-page-header-title">Notes</h2>
                                </div>
                                <div className="col-xs-6">
                                    <p className="add-category-btn" onClick={this.handleClick.bind(this)}>Create Notebook</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-10 col-xs-offset-1">
                        {
                            data.map(function(noteCat,key){
                                return <NoteCategory noteCats={noteCat} key={key} />
                            })
                        }
                    </div>
                    {this.getPopup()}
                </div>
            </div>
        );
    }
}

export class NoteCategory extends React.Component{
    constructor(props) {
        super(props);
        this.state={}
    }

    render() {
        let catData = this.props.noteCats;

        console.log(catData);
        return (
            <div className="row row-clr pg-notes-page-content-item pg-box-shadow">
                <div className="col-xs-2 note-cat-thumb">
                    <div className="cat-icon-holder">
                        <span className="cat-icon"></span>
                        <h3 className="cat-title">{catData.category}</h3>
                    </div>
                </div>
                <div className="col-xs-10 pg-notes-page-content-item-right-thumbs">
                    <NoteThumb catData={catData.notes} />
                </div>
            </div>
        );
    }
}

export const NoteThumb = ({catData}) => {
    let _this = this;
    let _notes = (typeof  catData != 'undefined')?catData:[];

    return(
        <div className="pg-notes-item-main-row">
            <div className="note-holder">
                <div className="row-clear add-new-note note">
                    <p className="add-note-text">Add new</p>
                </div>
            </div>
            {
                _notes.map(function(note,key){
                    return (
                        <div className="note-holder" id={note.id}>
                            <div className="row-clear note">
                                <div className="time-wrapper">
                                    <p className="date-created">{note.createdDate}</p>
                                    <p className="time-created">{note.createdTime}</p>
                                </div>
                                <div className="note-title-holder">
                                    <p className="note-title">{note.title}</p>
                                </div>
                                <span className="note-delete-btn"></span>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
};
