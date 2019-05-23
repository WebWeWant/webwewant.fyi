const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-es");
const htmlmin = require("html-minifier");

module.exports = function(eleventyConfig) {
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", dateObj => {
    if ( ! (dateObj instanceof Date) )
    {
      dateObj = new Date(dateObj);
    }
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machineDate", dateObj => {
    if ( ! (dateObj instanceof Date) )
    {
      dateObj = new Date(dateObj);
    }
    return DateTime.fromJSDate(dateObj).toISO();
  });

  // HTML date range
  eleventyConfig.addShortcode("DateRange", ( string, html ) => {
    let [start, end] = string.split("|");
    start = new Date(start);
    end = new Date(end);
    let s_yr = start.getFullYear(),
        s_mo = start.getMonth() + 1,
        s_dy = start.getDate(),
        s_dt,
        e_yr = end.getFullYear(),
        e_mo = end.getMonth() + 1,
        e_dy = end.getDate(),
        e_dt,
        template = '<time datetime="DATETIME">DISPLAY</time>';
    
    switch (true)
    {
      // same date
      case ( s_dy == e_dy && s_mo == e_mo && s_yr == e_yr ):
        s_dt	= DateTime.fromJSDate(start).toISO();
        start = DateTime.fromJSDate(start).toFormat("dd LLL yyyy");
        end   = false;
        break;
      // month & year match
      case ( s_mo == e_mo && s_yr == e_yr ):
        s_dt	= DateTime.fromJSDate(start).toISO();
        start = DateTime.fromJSDate(start).toFormat("dd");
        e_dt	= DateTime.fromJSDate(end).toISO();
        end   = DateTime.fromJSDate(end).toFormat("dd LLL yyyy");
        break;
      // years match
      case s_yr == e_yr:
        s_dt	= DateTime.fromJSDate(start).toISO();
        start = DateTime.fromJSDate(start).toFormat("dd LLL");
        e_dt	= DateTime.fromJSDate(end).toISO();
        end   = DateTime.fromJSDate(end).toFormat("dd LLL yyyy");
        break;
      // nothing matches
      default:
        s_dt	= DateTime.fromJSDate(start).toISO();
        start = DateTime.fromJSDate(start).toFormat("dd LLL yyyy");
        e_dt	= DateTime.fromJSDate(end).toISO();
        end   = DateTime.fromJSDate(end).toFormat("dd LLL yyyy");
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
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  // limit filter
  eleventyConfig.addNunjucksFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  eleventyConfig.addFilter("past_events", function(events) {
    return events.filter( event => new Date(event.end_date) <= new Date() );
  });

  eleventyConfig.addFilter("future_events", function(events) {
    return events.filter( event => new Date(event.end_date) >= new Date() );
  });

  eleventyConfig.addCollection("problems", function(collection) {
    // get unsorted items
    return collection.getAll().filter( item => {
      return item.inputPath.indexOf("problems/") > -1;
    });
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

  eleventyConfig.addFilter("toString", function(collection, separator, props) {
    var ret = [],
        i = collection.length;
    while ( i-- )
    {
      let str = [],
          j = props.length;
      while ( j-- )
      {
        let text = collection[i][props[j]];
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

  // only content in the `posts/` directory
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getAllSorted().filter(function(item) {
      return item.inputPath.match(/^\.\/posts\//) !== null;
    });
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("manifest.json");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("_includes/assets/");

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
