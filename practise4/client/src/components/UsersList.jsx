import UserItem from "./UserItem";

function UsersList({ goods, canManageGoods, onBuy, onEdit, onDelete }) {
  if (!goods.length) {
    return <p className="emptyState">Goods were not found</p>;
  }

  return (
    <section className="goodsList">
      {goods.map((good) => (
        <UserItem
          key={good.id}
          good={good}
          canManageGoods={canManageGoods}
          onBuy={onBuy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

export default UsersList;
