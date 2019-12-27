import { app, h } from 'hyperapp';
import './products.css';

const Fragment = (props, children) => children;

const Product = ({ product, newProduct, input, create, isAdmin, fn}) => {
  let price;
  let name;
  let description;
  return (
    <>
      {product ? (
        <div class='card product'>
          <div class='card-header'>
            <strong>{product.name}</strong>
          </div>
          <div class='card-body'>
            <img onclick={e=>myfunction()}
              class='rounded float-left product-image'
              src={ product.image.startsWith('http') ? product.image : '//robohash.org/' + product.image + '?set=set4&bgset=bg2'}
            ></img>

            <dl class='row'>
              <dt class='col-sm-4'>Name</dt>
              <dd class='col-sm-8'>
                <h5>{product.name}</h5>
              </dd>

              <dt class='col-sm-4'>Description</dt>
              <dd class='col-sm-8'>
                <p>{product.description}</p>
              </dd>

              <dt class='col-sm-4'>Proposed Price</dt>
              <dd class='col-sm-8'>
                <p>$ {product.price / 100}</p>
              </dd>

              <dt class='col-sm-4'>Status</dt>
              <dd class='col-sm-8'>
                <p>{product.status}</p>
              </dd>
            </dl>
          </div>
          {isAdmin ? (
            <div class='card-footer'>
              <div class='input-group'>
                <div class='input-group-prepend'>
                  <button
                    class='btn btn-outline-primary'
                    type='button'
                    onclick={e => fn({action:'start',data:price})}>
                    Start
                  </button>
                  <button
                    class='btn btn-outline-primary'
                    type='button'
                    onclick={e => fn({action:'stop'})}
                  >
                    Stop
                  </button>
                </div>
                <input 
                  type='number'
                  class='form-control'
                  placeholder='Enter timeOut' 
                  oninput={e => (price = e.target.value)}
                />
                <div class='input-group-append'>
                  <button
                    class='btn btn-outline-primary'
                    type='button'
                    onclick={e => fn({action:'close'})}
                  >
                    Set final price and close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div class='card-footer'>
              <div class='input-group'>
                <input
                  type='number'
                  class='form-control'
                  placeholder='price'
                  oninput={e => (price = e.target.value)}
                />
                <div class='input-group-append'>
                  <button class='btn btn-primary' type='button' onclick={e => fn({action:'pricing',data:price})}>
                    Given Price
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
      
      <div class='card' id="createSession">
        <div class='card-header'>
          <strong>Create new session</strong>
        </div>
        <div class='card-body'>
          <div class='row'>
            <div class='col-sm-12'>
              <div class='form-group'>
                <label for='name'>Product name</label>
                <input
                  type='text'
                  class='form-control'
                  id='name'
                  value={newProduct.name}
                  oninput={e => {
                    input({ field: 'name', value: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>

          <div class='row'>
            <div class='col-sm-12'>
              <div class='form-group'>
                <label for='description'>Product description</label>
                <input
                  type='text'
                  class='form-control'
                  id='description'
                  value={newProduct.description}
                  oninput={e => {
                    input({ field: 'description', value: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>

          <div class='row'>
            <div class='col-sm-12'>
              <div class='form-group'>
                <label for='image'>Product image</label>
                <input
                  type='text'
                  class='form-control'
                  id='image'
                  placeholder='http://'
                  value={newProduct.image}
                  oninput={e => {
                    input({ field: 'image', value: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div class='card-footer'>
          <button type='submit' class='btn btn-primary' onclick={create}>
            Create
          </button>
        </div>
      </div>

      {/* test phan update product */}
      
      
    {product? ( 
      <div class='card' id="updateProduct">
        <div class='card-header'>
          <strong>update product information</strong>
        </div>
        <div class='card-body'>
          <div class='row'>
            <div class='col-sm-12'>
              <div class='form-group'>
                <label for='name'>Product name</label>
                <input
                  type='text'
                  class='form-control'
                  id='_name'
                  value={product.name}
                  // oninput={e => {
                  //   input({ field: 'name', value: e.target.value });
                  // }}
                  oninput={e=>(name = e.target.value)}
                />
              </div>
            </div>
          </div>

          <div class='row'>
            <div class='col-sm-12'>
              <div class='form-group'>
                <label for='description'>Product description</label>
                <input
                  type='text'
                  class='form-control'
                  id='_description'
                  value={product.description}
                  // oninput={e => {
                  //   input({ field: 'description', value: e.target.value });
                  // }}
                  oninput = {e=>(description = e.target.value)}
                />
              </div>
            </div>
          </div>

          <div class='row'>
            <div class='col-sm-12'>
              <div class='form-group'>
                <label for='image'>Product image</label>
                <input
                  type='text'
                  class='form-control'
                  id='_image'
                  placeholder='http://'
                  value={product.image}
                  readonly = 'true'
                  // oninput={e => {
                  //   input({ field: 'image', value: e.target.value });
                  // }}
                />
              </div>
            </div>
          </div>
        </div>
        <div class='card-footer'>
          <button type='submit' class='btn btn-primary' onclick={e=>fn({action:'update',name:name,description:description,_name:product.name,_description:product.description})}>
            update
          </button>
        </div>
      </div>
    ):(
      <></>
    )}
      {/* test phan update product */}
    </>
  );
};

const ProductRow = ({ product, index, select, currentIndex }) => (
  <tr
    onclick={e => select(index)}
    class={index === currentIndex ? 'active' : ''}
  >
    <th scope='row'>{product.no}</th>
    <td>{product.name}</td>
    <td>{product.description} </td>
    <td>$ {product.price /100}</td>
    <td>{product.status}</td>
    {/* <td><button  id='editProduct' onclick={e=>myfunction()}>update</button></td> */}
    {/* <td><i class='nav-icon cui-people' onclick={e=>myfunction()}></i></td> */}
  </tr>
);
const Products = ({ match }) => (
  { newProduct, sessions, currentProductIndex, isAdmin },
  { inputNewProduct, createProduct, selectProduct, sessionFn}
) => {
  return (
    <div class='d-flex w-100 h-100'>
      <div class='bg-white border-right products-list'>
        <table class='table table-hover table-striped'>
          <thead>
            <tr>
              <th scope='col'>#</th>
              <th scope='col'>Product Name</th>
              <th scope='col'>Description</th>
              <th scope='col'>Proposed price</th>
              <th scope='col'>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((p, i) => {
              p.no = i + 1;
              return (
                <ProductRow
                  product={p}
                  index={i}
                  select={selectProduct}
                  currentIndex={currentProductIndex}
                  isAdmin={isAdmin}
                ></ProductRow>
              );
              // return ProductRow(p, i, selectProduct, currentProductIndex);
            })}
          </tbody>
        </table>
      </div>
      <div class='pl-2 flex product-detail'>
        <Product
          newProduct={newProduct}
          input={inputNewProduct}
          create={createProduct}
          product={sessions[currentProductIndex]}
          isAdmin={isAdmin}
          fn={sessionFn}
        ></Product>
      </div>
    </div>
  );
};

export { Products };
