function UserItem({ good, onEdit, onDelete }) {
  return (
    <article className="goodRow">
      <div className="goodRow__main">
        <h3>{good.name}</h3>
        <p>{good.description}</p>
        <div className="goodRow__meta">
          <span>#{good.id}</span>
          <span>{good.category}</span>
          <span>{Number(good.price).toLocaleString("ru-RU")} RUB</span>
          <span>Stock: {good.stock}</span>
        </div>
      </div>

      <div className="goodRow__actions">
        <button className="btn" onClick={() => onEdit(good)}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(good.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
}

export default UserItem;
