const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-es");
const sanitizeHTML = require('sanitize-html')
const htmlmin = require("html-minifier");
const widont = require("widont");
const md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
});
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const inclusiveLangPlugin = require("@11ty/eleventy-plugin-inclusive-language");

module.exports = function(eleventyConfig) {
  const VOTE_TYPES = ['like-of', 'bookmark-of', 'mention-of'];


  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", date => {
    return DateTime.fromJSDate(date).toFormat("dd LLL yyyy");
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machineDate", date => {
    return DateTime.fromJSDate(date).toISO();
  });

  // Markdownify
  eleventyConfig.addFilter("markdownify", text => {
    return md.renderInline( text );
  });

  // unSluggify
  eleventyConfig.addFilter("unslug", text => {
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text.replace(/-/g, ' ');
  });

  // Name List
  eleventyConfig.addShortcode("NameList", names => {
    let strings = [],
        string = "",
        count = names.length;
    while ( count-- )
    {
      let url = names[count].url || `https://twitter.com/${names[count].twitter}/`;
      strings.unshift( `<a href="${url}">${names[count].name}</a>` );
    }
    count = strings.length;
    if ( count > 2 )
    {
      strings[count-1] = "and " + strings[count-1];
      string = strings.join(", ");
    }
    else if ( count == 2 )
    {
      string = `${strings[0]} and ${strings[1]}`;
    }
    else
    {
      string = strings[0];
    }
    return `${string}`;
  });

  // Fix proper nouns
  eleventyConfig.addFilter("fixNames", text => {
    let test = text.toLowerCase(),
        acronyms = [ "html", "css", "svg" ],
        camel_case = [ "JavaScript", "DevTools", "WebDriver", "WebRTC" ],
        i, proper_name;
    
    if ( acronyms.indexOf( test ) > -1 )
    {
      return text.toUpperCase();
    }
    else
    {
      for ( i in camel_case )
      {
        proper_name = camel_case[i];
        if ( proper_name.toLowerCase() == test )
        {
          return proper_name;
        }
      }
    }
    return text;
  });  

  // HTML date range
  eleventyConfig.addShortcode("DateRange", ( string, html ) => {
    let [start, end, IANA_zone] = string.split("|");

    start = DateTime.fromISO( start, { zone:  IANA_zone });
    end = DateTime.fromISO( end, { zone:  IANA_zone });

    let s_yr = start.year,
        s_mo = start.month,
        s_dy = start.day, 
        s_dt,
        e_yr = end.year,
        e_mo = end.month,
        e_dy = end.day,
        e_dt,
        template = '<time datetime="DATETIME">DISPLAY</time>';
    
    
    switch (true)
    {
      // same date
      case ( s_dy == e_dy && s_mo == e_mo && s_yr == e_yr ):
        s_dt	= start.toISO();
        start = start.toFormat("dd LLL yyyy");
        end   = false;
        break;
      // month & year match
      case ( s_mo == e_mo && s_yr == e_yr ):
        s_dt	= start.toISO();
        start = start.toFormat("dd");
        e_dt	= end.toISO();
        end   = end.toFormat("dd LLL yyyy");
        break;
      // years match
      case s_yr == e_yr:
        s_dt	= start.toISO();
        start = start.toFormat("dd LLL");
        e_dt	= end.toISO();
        end   = end.toFormat("dd LLL yyyy");
        break;
      // nothing matches
      default:
        s_dt	= start.toISO();
        start = start.toFormat("dd LLL yyyy");
        e_dt	= end.toISO();
        end   = end.toFormat("dd LLL yyyy");
        break;
    }

    if ( html )
    {
      string = template.replace("DATETIME", s_dt).replace("DISPLAY", start);
      if ( end )
      {
        string += "–" + template.replace("DATETIME", e_dt).replace("DISPLAY", end);
      }
    }
    else
    {
      string = start;
      if ( end )
      {
        string += "–" + end;
      }
    }

    return `${string}`;
  });

  // Widont
  eleventyConfig.addFilter("widont", function(text) {
    return `${widont( text )}`;
  });

  
  // Minify CSS
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter("jsmin", function(code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true
      });
      minified = minified.replace('\u00a0', '<b class="shy">\u00a0</b>');
      return minified;
    }
    return content;
  });

  // Minify JS output
  eleventyConfig.addTransform("jsmin", function(content, outputPath) {
    if (outputPath.indexOf(".js") > -1) {
      let minified = UglifyJS.minify(content);
      return minified;
    }
    return content;
  });

  // limit filter
  eleventyConfig.addNunjucksFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  /* eleventyConfig.addFilter("past_events", function(events) {
    console.log(event.end_date);
    return events.filter( event => new Date(event.end_date) <= new Date() );
  });

  eleventyConfig.addFilter("future_events", function(events) {
    return events.filter( event => new Date(event.end_date) >= new Date() );
  }); */

  eleventyConfig.addCollection("events", function(collection) {
    return collection.getAll().filter( item => {
      return item.inputPath.indexOf("events/") > -1;
    });
  });
  eleventyConfig.addCollection("past_events", function(collection) {
    return collection.getAll()
            .filter( item => item.inputPath.indexOf("events/") > -1 )
            .filter( event => new Date(event.data.end_date) <= new Date() )
            .sort( (a, b) => a.data.start_date < b.data.start_date );
  });
  eleventyConfig.addCollection("upcoming_events", function(collection) {
    return collection.getAll()
            .filter( item => item.inputPath.indexOf("events/") > -1 )
            .filter( event => new Date(event.data.end_date) >= new Date() )
            .sort( (a, b) => a.data.start_date > b.data.start_date );
  });

  eleventyConfig.addCollection("event_pitches", function(collection) {
    var events_with_winners = collection.getAll().filter( item => "pitches" in item.data ),
        wants = {};
    events_with_winners.forEach( event => {
      var event_data = {
            title: event.data.title,
            url: event.data.url,
            start_date: event.data.start_date,
            end_date: event.data.end_date,
            zone: event.data.zone,
            location: event.data.location,
            page: event.data.page.url
          },
          pitches = event.data.pitches,
          i = pitches.length;
      while ( i-- )
      {
        let id = pitches[i].toString();
        if ( !( id in wants ) ) {
          wants[id] = {
            pitched: [],
            judges_pick: [],
            community_pick: []
          };
        }
        wants[id].pitched.push(event_data);
      }
      wants[event.data.winners.judges].judges_pick.push(event_data);
      wants[event.data.winners.community].community_pick.push(event_data);
    });
    return wants;
  });

  eleventyConfig.addCollection("wants", collection => {
    // get unsorted items
    return collection.getAll().filter( item => {
      return item.inputPath.indexOf("wants/") > -1;
    });
  });
  eleventyConfig.addFilter("extractID", url => {
    url = url.split("/");
    return url[2];
  });

  eleventyConfig.addCollection("topWants", collection => {
    const pluck = 3,
          win_vote_factor = 30,
          top_wants = {},
          all = collection.getAll(),
          wants = all.filter( item => {
            return item.inputPath.indexOf("wants/") > -1;
          }),
          webmentions = all[0].data.webmentions.children;
    
    // gather winners
    var winners = [];
    collection.getAll()
      .map( ( item, i ) => {
        if ( item.inputPath.indexOf("events/") > -1 &&
              'winners' in item.data )
        {
          winners.push( item.data.winners.judges, item.data.winners.community );
        }
      });
    
    // Calculate votes
    var votes = {};
    wants.map( ( want, i ) => {
      
      // capture the id
      let id = parseInt( want.url.split('/')[2], 10 ); // make it a number
      wants[i].id = id;
      
      // process votes from webmentions into an array
      let count = 0,
          mentions = webmentions
                      // permalink would be better, but this works too
                      .filter(entry => entry['wm-target'].indexOf(want.url) > -1 )
                      .filter(entry => VOTE_TYPES.includes(entry['wm-property']));
      
      if ( mentions.length )
      {
        count += mentions.length;
      }

      // Factor in live voting
      if ( winners.indexOf( id ) > -1 ) {
        count += win_vote_factor;
      }
      
      votes[want.url] = count;
    });
    // console.log( votes );

    // sort wants by votes
    wants
      .sort( (a, b) => {
        return votes[b.url] - votes[a.url];
      })
      // loop through all
      .map( want => {
        // pluck top by tag
        want.data.tags.forEach(function( tag ){
          
          // add to tag group
          if ( ! (tag in top_wants) )
          {
            top_wants[tag] = [];
          }

          // no more than pluck
          if ( top_wants[tag].length > (pluck - 1) )
          {
            return;
          }

          top_wants[tag].push( want );

        });
      });
      
    // return the new collection sorted by tag
    //console.log( top_wants );
    return top_wants;
  });

  eleventyConfig.addCollection("tags", function(collection) {
    // get unsorted items
    var tags = [];
    collection.getAll()
      .map( item => {
        if ( item.inputPath.indexOf("wants/") > -1 )
        {
          item.data.tags.map( tag => {
            if ( tags.indexOf( tag ) < 0 )
            {
              tags.push( tag );
            }
          });
        }
      });
    return tags.sort();
  });

  eleventyConfig.addPairedShortcode("getwant", (content, wants, id) => {
    let want = wants.filter( item => item.fileSlug == id )[0];
    return content
             .replace( "url", want.url )
             .replace( "data.title", md.render( want.data.title ) )
             .replace( /<\/?p>/g, "" )
             .replace( "data.submitter", want.data.submitter );
  });

  // eleventyConfig.addFilter("by_start_date", function(events, dir) {
  //   return events.sort( (a,b) => {
  //     a = new Date(a.start_date);
  //     b = new Date(b.start_date);
  //     if ( dir == "asc" )
  //     {
  //       return a < b ? -1 : ( a > b ? 1 : 0 );
  //     }
  //     else
  //     {
  //       return a > b ? -1 : ( a < b ? 1 : 0 );
  //     }
  //   });
  // });

  // Webmentions Filter
  eleventyConfig.addFilter('discussionOfWant', (webmentions, url) => {
    const allowedTypes = ['in-rely-to', 'mention-of'];
    const clean = content =>
      sanitizeHTML(content, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a'],
        allowedAttributes: {
          a: ['href']
        }
      });

    return webmentions
      .filter(entry => entry['wm-target'] === url)
      .filter(entry => allowedTypes.includes(entry['wm-property']))
      .filter(entry => !!entry.content)
      .map(entry => {
        const { html, text } = entry.content;
        entry.content.value = html ? clean(html) : clean(text);
        return entry;
      });
  });

  eleventyConfig.addFilter('votesForWant', (webmentions, url) => {
    return webmentions
      .filter(entry => entry['wm-target'] === url)
      .filter(entry => VOTE_TYPES.includes(entry['wm-property']))
      .length;
  });

  eleventyConfig.addFilter("toString", function(collection, separator, props) {
    var ret = [],
        i = collection.length;
    while ( i-- )
    {
      let str = [],
          j = props.length;
      while ( j-- )
      {
        let text = collection[i].data[props[j]];
        if ( props[j].indexOf("date") > -1 )
        {
          text = new Date( text );
          text = DateTime.fromJSDate(text).toFormat("dd LLL yyyy");
        }
        str.unshift( text );
      }
      ret.unshift( str.join( separator ) );
    }
    return ret;
  });

  eleventyConfig.addFilter("getDirectory", function(url) {
    url = url.split('/');
    return url[1];
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("sw.js");
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("static/js");
  eleventyConfig.addPassthroughCopy("site.webmanifest");
  eleventyConfig.addPassthroughCopy("admin");
  // eleventyConfig.addPassthroughCopy("_includes/assets/");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: false
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  eleventyConfig.addPlugin(syntaxHighlight);

  //eleventyConfig.addPlugin(inclusiveLangPlugin);

  return {
    templateFormats: ["md", "njk", "html", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
