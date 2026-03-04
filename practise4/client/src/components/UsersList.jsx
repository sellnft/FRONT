import UserItem from "./UserItem";

function UsersList({ goods, onEdit, onDelete }) {
  if (!goods.length) {
    return <p className="emptyState">Товары не найдены</p>;
  }

  return (
    <section className="goodsList">
      {goods.map((good) => (
        <UserItem key={good.id} good={good} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </section>
  );
}

export default UsersList;
