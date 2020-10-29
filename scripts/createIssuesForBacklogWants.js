const fetch = require('node-fetch');
require('dotenv').config();
const file = require('../_site/feeds/wants.json');
const user = 'WebWeWant';
const repo = 'webwewant.fyi';
var i = 0;

createIssueFromJSON = function(file) {
    file.posts.forEach(want => {

        if ( 'external_url' in want ) {
          return;
        }

        /* if ( i >= 1 )
        {
          return;
        }
        i++; */

        var issue = {
            title: want.title,
            owner: user,
            repo: repo,
            assignees: [ "aarongustafson" ],
            body: `${want.content_text}\n\n<hr>\n\n${want.url}`,
            labels: [ "for-discussion" ]
        };
        
        //console.log(issue);
        //return;

        fetch(`https://api.github.com/repos/${user}/${repo}/issues`, {
            method: 'post',
            body:    JSON.stringify(issue),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `token ${process.env.TOKEN}`,
              'accept': 'application/vnd.github.v3+json'
            }
        })
        .then( res => res.json() )
        .then( json => {
          if ( 'html_url' in json )
          {
            console.log( `Want ${want.id} discussion: ${json.html_url.replace("issues","discussions")}` );
          }
          else {
            console.log( 'Something went wrong.', json, issue );
          }
        });
    })
}

createIssueFromJSON(file);