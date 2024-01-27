export const fetchWithJustQueryText = async ({ queryText, variables }) => {
   const response = await fetch('https://api.gallery.so/glry/graphql/query', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       query: queryText,
       variables,
     }),
   }).then((response) => response.json());
 
   return response;
 };
 