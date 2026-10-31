import React from "react";

import ActionButton from "../buttons/ActionButton";

const TableActions = ({
  id,

  role,
  resource,

  detailUrl,
  editUrl,

  onDetail,
  onDelete,

  showDetail = true,
  showEdit = true,
  showDelete = true,
}) => {
  return (
    <div className="flex items-center gap-2">
      {showDetail &&
        (detailUrl ? (
          <ActionButton action="detail" to={detailUrl} />
        ) : (
          <ActionButton action="detail" onClick={() => onDetail?.(id)} />
        ))}

      {showEdit && editUrl && (
        <ActionButton
          action="edit"
          role={role}
          resource={resource}
          permission="update"
          to={editUrl}
        />
      )}

      {showDelete && (
        <ActionButton
          action="delete"
          role={role}
          resource={resource}
          permission="delete"
          onClick={() => onDelete?.(id)}
        />
      )}
    </div>
  );
};

export default TableActions;
