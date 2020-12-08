/*--------------------------

  Export Wants To Edge ADO

  Be sure to set up the following in /.env prior to running this :-)

  ADO_PAT - Your ADO Personal Access Token (https://dev.azure.com/microsoft/_usersSettings/tokens)
  ADO_USER - Your ADO User account
  ADO_ORG - The ADO org (microsoft)
  ADO_PROJECT - The ADO Project (Edge)

*/

const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const TRACKING_FILE = "_data/tracking.json";

const feed = require("../_site/feeds/wants.json");
const { triggerAsyncId } = require('async_hooks');
const tracking = require(`../${TRACKING_FILE}`);

syncToADO = function(feed, tracking) {

  feed.posts.forEach(want => {

    if ( tracking.wants[want.id] &&
        'Edge' in tracking.wants[want.id]  ) {
      console.log(`${want.id} already tracked as ${tracking.wants[want.id].Edge}`);
      return;
    }

    var description = want.content_html
                          .replace(/&lt;/g, "<")
                          .replace(/&gt;/g, ">")
                          .replace(/&quot;/g, '"');
    description += "<hr>";
    description += `<p>Imported from <a href="${want.url}">${want.url}</a></p>`;
    description += `<p>Discussion: <a href="${want.external_url}">${want.external_url}</a></p>`;

    var tags = want.tags;
    tags.map(( tag, i ) => {
      tags[i] = `Web We Want - ${tag}`
    });
    tags.unshift("Web We Want");

    var work_item = [
      {
        "op": "add",
        "path": "/fields/System.WorkItemType",
        "from": null,
        "value": "Scenario"
      },
      {
        "op": "add",
        "path": "/fields/System.AreaPath",
        "from": null,
        "value": "Edge\\Dev Experience\\Ecosystem"
      },
      {
        "op": "add",
        "path": "/fields/System.IterationPath",
        "from": null,
        "value": "Edge"
      },
      {
        "op": "add",
        "path": "/fields/System.State",
        "from": null,
        "value": "Proposed"
      },
      {
        "op": "add",
        "path": "/fields/System.Title",
        "from": null,
        "value": `[Web We Want] ${want.title.replace("I want", "Developers want")}`
      },
      {
        "op": "add",
        "path": "/fields/System.Description",
        "from": null,
        "value": description
      },
      // Comments
      // {
      //   "op": "add",
      //   "path": "/fields/System.History",
      //   "from": null,
      //   "value": `Imported from <a href="${want.url}">${want.url}</a>`
      // },
      {
        "op": "add",
        "path": "/fields/System.AssignedTo",
        "from": null,
        "value": "webwewant@microsoft.com"
      },
      // Tags are comma separated
      {
        "op": "add",
        "path": "/fields/System.Tags",
        "from": null,
        "value": tags.join(", ")
      }
    ];
    
    console.log( work_item, JSON.stringify( work_item ) );
    return;

    const auth = `Basic ${Buffer.from(
      `${process.env.ADO_USER}:${process.env.ADO_PAT}`
    ).toString('base64')}`;

    fetch(
      `https://dev.azure.com/${process.env.ADO_ORG}/${process.env.ADO_PROJECT}/_apis/wit/workitems/$scenario?api-version=6.0`,
      {
        method: "patch",
        body: JSON.stringify( work_item ),
        headers: {
          "Authorization": auth,
          "Content-Type": "application/json-patch+json"
        }
      }
    )
    .then( res => {
      console.log(res);
      return res.json();
    })
    .then( json => {
      if ( 'id' in json )
      {
        console.log( `Want ${want.id} created as Scenario: ${json.id}` );
        logWantInEdgeADO( want.id, json.id );
      }
      else
      {
        console.log( 'Something went wrong.', json, work_item );
      }
    });
  });
  
};

function logWantInEdgeADO( want_id, ado_id )
{
  if ( ! ( want_id in tracking.wants ) )
  {
    tracking.wants[want_id] = {};
  }
  tracking.wants[want_id].Edge = ado_id.toString();
  fs.writeFile( TRACKING_FILE, JSON.stringify( tracking ), "utf8", function (err) {
    if (err) {
      console.log(err);
    }
    console.log(`Saved ADO ${ado_id} to want ${want_id}.`);
  });
}

syncToADO(feed, tracking);