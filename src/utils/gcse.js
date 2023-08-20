const API_KEY = localStorage.getItem('gcseKey');
const SEARCH_ENGINE_ID = localStorage.getItem('gcseId');

async function search(query) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        try {
            const queryParams = new URLSearchParams({
                key: API_KEY,
                cx: SEARCH_ENGINE_ID,
                q: query,
            });

            const response = await fetch(`https://www.googleapis.com/customsearch/v1?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                referrerPolicy: 'no-referrer',
                redirect: 'follow',
            });
            const data = await response.json();
            const results = data.items;
            return resolve(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            return resolve([]);
        }
    });
}

export default { search };