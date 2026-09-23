import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import api from "../../services/api";

import RelatedPodcastCard from "../../components/dashboard/RelatedPodcastCard";

import PodcastPlayer from "../../components/podcast/PodcastPlayer";
import PodcastActions from "../../components/podcast/PodcastActions";
import ShareModal from "../../components/common/ShareModal";
import DescriptionCard from "../../components/video/DescriptionCard";

import "./WatchPodcastPage.css";

interface Creator {
  name: string;
}

interface Content {
  _id: string;

  title: string;

  thumbnail: string;

  podcastAudio: string;

  creator: Creator;

  category: string;
    description: string;

  bookmarks: number;

  shares: number;

  bookmarked: boolean;
}

export default function WatchPodcastPage() {

  const { id } = useParams();

  const [podcast, setPodcast] = useState<Content | null>(null);
  const [allPodcasts, setAllPodcasts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(()=>{
      fetchPodcast();
      fetchFeed();
  },[id]);

  const fetchPodcast=async()=>{

      try{

          setLoading(true);

          const res=await api.get(`/content/${id}`);

          setPodcast(res.data.content);

      }

      catch(err){

          console.log(err);

      }

      finally{

          setLoading(false);

      }

  };

  const handleBookmark=async()=>{

    if (!podcast) return;

    try{

        const res=await api.post(

            `/content/${podcast._id}/bookmark`

        );

        setPodcast((prev) =>
          prev ? { ...prev, bookmarks: res.data.bookmarks, bookmarked: res.data.bookmarked } : prev
        );

    }

    catch(err){

        console.log(err);

    }

};

const handleShare=async()=>{
    if (!podcast) return;
    setIsShareModalOpen(true);
    try{
        const res=await api.post(
            `/content/${podcast._id}/share`
        );
        setPodcast((prev) =>
          prev ? { ...prev, shares: res.data.shares } : prev
        );
    }
    catch(err){
        console.log(err);
    }
};

const handleDownload=()=>{

    if (!podcast) return;

    const link=document.createElement("a");

    link.href=podcast.podcastAudio;

    link.download=`${podcast.title}.mp3`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

};

  const fetchFeed=async()=>{

      try{

          const res=await api.get("/content");

          setAllPodcasts(res.data.content);

      }

      catch(err){

          console.log(err);

      }

  };

  const relatedPodcasts=useMemo(()=>{

      if(!podcast) return [];

      return allPodcasts.filter(item=>

          item._id!==podcast._id &&

          item.podcastAudio &&

          item.category===podcast.category

      );

  },[podcast,allPodcasts]);

  if(loading || !podcast){

      return(

          <DashboardLayout>

              <div className="loading-page">

                  Loading...

              </div>

          </DashboardLayout>

      );

  }

  return(

      <DashboardLayout>

          <div className="podcast-page">

              <div className="podcast-main">

                  {/* Podcast Components */}
                  <PodcastPlayer
                    title={podcast.title}
                    creator={podcast.creator.name}
                    thumbnail={podcast.thumbnail}
                    audio={podcast.podcastAudio}
                    onNext={(isShuffle) => {
                      if (relatedPodcasts.length > 0) {
                        const nextIndex = isShuffle 
                          ? Math.floor(Math.random() * relatedPodcasts.length)
                          : 0;
                        window.location.href = `/podcast/${relatedPodcasts[nextIndex]._id}`;
                      }
                    }}
                />

                                <PodcastActions

                    bookmarked={podcast.bookmarked}

                    bookmarks={podcast.bookmarks}

                    shares={podcast.shares}

                    onBookmark={handleBookmark}

                    onShare={handleShare}

                    onDownload={handleDownload}

                />

                <DescriptionCard description={podcast.description} />

                <div className="queue-card">

                <h3>🎼 Queue</h3>

                <p>

                    Smart Podcast Queue

                    Coming Soon

                </p>

            </div>
            
            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                url={window.location.href} 
                title={podcast.title} 
                embedType="podcast" 
            />

              </div>

              <aside className="podcast-sidebar">

                  <h2>

                      Related Podcasts

                  </h2>

                  {

                      relatedPodcasts.map(item=>(

                          <RelatedPodcastCard
                              key={item._id}
                              podcast={item}
                          />

                      ))

                  }

              </aside>

          </div>

      </DashboardLayout>

  );

}