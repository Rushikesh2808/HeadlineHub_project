<?php
header("Content-Type: application/json");

// Example sources (Replace with your actual RSS/API fetching logic)
$sources = [
    "times-of-india-list:https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        "the-hindu-list:https://www.thehindu.com/news/national/feeder/default.rss",
        "economic-times-list:https://economictimes.indiatimes.com/rssfeedsdefault.cms",
        "sportstar-list:https ://www.thehindu.com/sport/feeder/default.rss",
        "espn-cricinfo-list : https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
        "ndtv-list : https://feeds.feedburner.com/ndtvnews-top-stories",
        "dainik-bhaskar-list:https://www.bhaskar.com/rss-v1--category-1061.xml",
        "hindustan-list : https://www.hindustantimes.com/feeds/rss/analysis/rssfeed.xml",
        "divya-marathi-list : https://divyamarathi.bhaskar.com/rss-feed/2159/"
];

$news = [];

foreach ($sources as $source) {
    $rss = simplexml_load_file($source);
    if ($rss) {
        foreach ($rss->channel->item as $item) {
            $news[] = [
                "title" => (string) $item->title,
                "description" => (string) $item->description,
                "link" => (string) $item->link
            ];
        }
    }
}

echo json_encode($news);
?>
