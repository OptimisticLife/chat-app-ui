type LoadingButtonPropsType = {
  id: string;
  btnHandler: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  label: string;
};

export default function LoadingButton({
  id,
  btnHandler,
  isDisabled,
  isLoading,
  label,
}: LoadingButtonPropsType) {
  return (
    <button
      id={id}
      className="upload-form-btn"
      onClick={btnHandler}
      disabled={isDisabled}
    >
      <p>{label}</p>
      {isLoading && <span className="loader"></span>}
    </button>
  );
}
