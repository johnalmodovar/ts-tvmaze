import jQuery from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $('#episodesList');
const $showEpisodesButton = $('.Show-getEpisodes');
const $searchForm = $("#searchForm");

const BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMAGE_URL = "https://tinyurl.com/tv-missing";


interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: string;
  number: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShowsByTerm(term: string): Promise<ShowInterface[]> {
  const params = new URLSearchParams(`q=${term}`);
  const response = await fetch(`${BASE_URL}/search/shows?${params}`);
  const data = await response.json() as [];

  return data.map((s: Record<any, any>) => (
    { id: s.show.id,
      name: s.show.name,
      summary: s.show.summary,
      image: s.show.image.original || DEFAULT_IMAGE_URL }
  ));
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows: ShowInterface[] = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: Event): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  const data = await response.json() as [];

  return data.map((episode: Record<any, any>) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }))
}

/** Given an array of episodes, create li for each episode and appends to DOM */
function populateEpisodes(episodes: EpisodeInterface[]): void {
  $episodesList.empty();

  for (const episode of episodes) {
    const $episode = $(`<li>${episode.name}
                        (season ${episode.season},
                        number ${episode.number})</li>`);

    $episodesList.append($episode);
  }

  $episodesArea.show();
}

/** Handles event for showing episodes in the DOM. */
async function listEpisodesOnClick(evt: Event): Promise<void> {
  const showId = Number($(evt.target).closest('.Show').attr('data-show-id'));
  const episodes = await getEpisodesOfShow(showId);

  populateEpisodes(episodes);
}

$showsList.on('click', $showEpisodesButton, listEpisodesOnClick);