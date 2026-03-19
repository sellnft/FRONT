function UserItem({ good, canManageGoods, onBuy, onEdit, onDelete }) {
  const isOutOfStock = Number(good.stock) <= 0;

  return (
    <article className="goodRow">
      <div className="goodRow__main">
        <h3>{good.name}</h3>
        <p>{good.description}</p>
        <div className="goodRow__meta">
          <span>#{good.id}</span>
          <span>{good.category}</span>
          <span>{Number(good.price).toLocaleString("ru-RU")} RUB</span>
          <span>{isOutOfStock ? "Out of stock" : `Stock: ${good.stock}`}</span>
        </div>
      </div>

      <div className="goodRow__actions">
        {canManageGoods ? (
          <>
            <button className="btn" onClick={() => onEdit(good)}>
              Edit
            </button>
            <button className="btn btn--danger" onClick={() => onDelete(good.id)}>
              Delete
            </button>
          </>
        ) : (
          <button className="btn btn--buy" onClick={() => onBuy(good)} disabled={isOutOfStock}>
            Buy
          </button>
        )}
      </div>
    </article>
  );
}

export default UserItem;
