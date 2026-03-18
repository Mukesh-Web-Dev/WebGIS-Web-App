self.onmessage = async function(e){
  try{
    importScripts('https://unpkg.com/shpjs@latest/dist/shp.min.js');
    const arrayBuffer = e.data;
    const result = await self.shp(arrayBuffer);
    self.postMessage({type:'result', data: result});
  }catch(err){
    self.postMessage({type:'error', error: String(err)});
  }
};
