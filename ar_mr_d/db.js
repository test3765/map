export const db = async(third_mesh) => {
  //注意! 引数として受け取った↑'third_mesh'は"文字の数字"です。しかし、JSONファイルに格納されている'third_mesh'は"数字"です.
  //だから、ここでNumberに変換してあげる必要があります.
  let meshCode = Number(third_mesh);
  
  try {
    const response = await fetch('cc.json');
    const json = await response.json();
    
    const  getFruitById = mesh => {
      const CityIndex = json.findIndex(data => data.mesh === mesh);
      return json[CityIndex];
    };

      const loNum = getFruitById(meshCode);
      let locationNumber = loNum.num;

    return {
        number: locationNumber
    };

  } catch (error) {
    console.error('エラー: ', error);
    throw error;
  }};