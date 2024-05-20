import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';

function Categories({swal}) {
  console.log("categories");

  const [editedCategory, setEditedCategory] = useState(null);
  const [name,setName] = useState('');
  const [parentCategory,setParentCategory] = useState('');
  const [categories,setCategories] = useState([]);
  const [properties,setProperties] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, [])
  function fetchCategories() {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    });
  }
  async function saveCategory(ev){
    ev.preventDefault();
    const data = {name,parentCategory,
      properties:properties.map(p => ({
        name:p.name,
        values:p.values.split(','),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put('/api/categories', data);
      setEditedCategory(null);
    } else {
      await axios.post('/api/categories', data);
    }
    setName('');
    setParentCategory('');
    setProperties([]);
    fetchCategories();
  }
  function editCategory(category){
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({name,values}) => ({
      name,
      values:values.join(',')
    }))
    );
  }
  function deleteCategory(category){
    swal.fire({
      title: 'Emin Misin !!',
      text: `${category.name}! Kategorisini Silmek İstiyor Musun ?`,
      showCancelButton: true,
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, Sil!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    }).then(async result => {
      if (result.isConfirmed) {
        const {_id} = category;
        await axios.delete('/api/categories?_id='+_id);
        fetchCategories();
      }
    });
  }
  function addProperty() {
    setProperties(prev => {
      return [...prev, {name:'',values:''}];
    });
  }
  function handlePropertyNameChange(index,property,newName) {

    setProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  function handlePropertyValuesChange(index,property,newValues) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }
  function removeProperty(indexToRemove) {
    setProperties(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }
  
  return (
    <Layout>
      <h1>Kategoriler</h1>
      <label>
        {editedCategory
          ? `Kategoriyi Düzenle ${editedCategory.name}`
          : 'Yeni Kategori Ekle'}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={'Kategori Adı'}
            onChange={ev => setName(ev.target.value)}
            value={name}/>

          <select
                  onChange={ev => setParentCategory(ev.target.value)}
                  value={parentCategory}>
            <option value="">Üst Kategori Yok</option>
            {categories.length > 0 && categories.filter(category => {
              console.log(category);
              if(category.parent) return false;
              return true;  
             })
            .map(category => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))  
            }
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Özellikler</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2">
            Yeni Özellik Ekle
          </button>
          {properties.length > 0 && properties.map((property,index) => (
            <div key={property.name} className="flex gap-1 mb-2">
              <input type="text"
                     value={property.name}
                     className="mb-0"
                     onChange={ev => {
                      //DONT LOSE FOCUS 
                      ev.preventDefault();
                      ev.stopPropagation();
                      handlePropertyNameChange(index,property,ev.target.value)}}
                     placeholder="özellik adı (örneğin: uzunluk)"/>
              <input type="text"
                     className="mb-0"
                     onChange={ev =>
                       handlePropertyValuesChange(
                         index,
                         property,ev.target.value
                       )}
                     value={property.values}
                     placeholder="değerler, virgül ile ayır"/>
              <button
                onClick={() => removeProperty(index)}
                type="button"
                className="btn-red">
                Kaldır
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName('');
                setParentCategory('');
                setProperties([]);
              }}
              className="btn-default">İptal</button>
          )}
          <button type="submit"
                  className="btn-primary py-1">
            Kaydet
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
          <tr>
            <td>Kategori Adı</td>
            <td>Üst Kategori</td>
            <td></td>
          </tr>
          </thead>
          <tbody>
          {categories.length > 0 && categories.map(category => (
            <tr key={category._id}>
            <td>{category.parent ? `${category.parent.name} - ${category.name}` : category.name}</td>
              <td>{category?.parent?.name}</td>
              <td>
                <button
                  onClick={() => editCategory(category)}
                  className="btn-default mr-1"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => deleteCategory(category)}
                  className="btn-red">Sil</button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({swal}, ref) => {
  return (
  
  <Categories swal={swal} />
)});
