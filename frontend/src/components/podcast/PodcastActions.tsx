import {
  Bookmark,
  Download,
  Share2,
} from "lucide-react";

import "./PodcastActions.css";

interface Props {

  bookmarked:boolean;

  bookmarks:number;

  shares:number;

  onBookmark:()=>void;

  onShare:()=>void;

  onDownload:()=>void;

}

export default function PodcastActions({

  bookmarked,

  bookmarks,

  shares,

  onBookmark,

  onShare,

  onDownload,

}:Props){

  return(

    <div className="podcast-actions">

      <button

        className={bookmarked?"active":""}

        onClick={onBookmark}

      >

        <Bookmark

          size={18}

          fill={bookmarked?"currentColor":"none"}

        />

        Save

      </button>

      <button

        onClick={onShare}

      >

        <Share2 size={18}/>

        Share

      </button>

      <button

        onClick={onDownload}

      >

        <Download size={18}/>

        Download

      </button>

    </div>

  );

}