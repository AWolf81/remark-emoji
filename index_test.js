const assert = require('assert');
const remark = require('remark');
const github = require('remark-github');
const headings = require('remark-autolink-headings');
const slug = require('remark-slug');
const emoji = require('.');

const compiler = remark().use(github).use(headings).use(slug).use(emoji);

function process(contents) {
    return new Promise((resolve, reject) => {
        compiler.process(contents, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result.contents);
        });
    });
}

describe('remark-emoji', () => {
    it('replaces emojis in text', () => {
        const cases = {
            'This is :dog:': 'This is 🐶\n',
            ':dog: is not :cat:': '🐶 is not 🐱\n',
            'Please vote with :+1: or :-1:': 'Please vote with 👍 or 👎\n',
            ':triumph:': '😤\n'
        };

        return Promise.all(
            Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c])))
        );
    });

    it('does not replace emoji-like but not-a-emoji stuffs', () => {
        const cases = {
            'This text does not include emoji.': 'This text does not include emoji.\n',
            ':++: or :foo: or :dog': ':++: or :foo: or :dog\n',
            '::': '::\n'
        };

        return Promise.all(
            Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c])))
        );
    });

    it('replaces in link text', () => {
        const cases = {
            'In inline code, `:dog: is not replaced`': 'In inline code, `:dog: is not replaced`\n',
            'In code, \n```\n:dog: is not replaced\n```': 'In code, \n\n    :dog: is not replaced\n',
            '[here :dog: and :cat: pictures!](https://example.com)': '[here 🐶 and 🐱 pictures!](https://example.com)\n'
        };

        return Promise.all(
            Object.keys(cases).map(c => process(c).then(r => assert.equal(r, cases[c])))
        );
    });
});
