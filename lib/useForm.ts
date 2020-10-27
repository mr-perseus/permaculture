const useForm = (defaultValues = {}) => (handler: any) => async (
    event: any,
) => {
    event.preventDefault();
    event.persist();
    const form = event.target;
    const data = Array.from(form.elements)
        // @ts-ignore
        .filter((element) => element.hasAttribute('name'))
        .reduce(
            (object, element) => ({
                // @ts-ignore
                ...object,
                // @ts-ignore
                [element.name]: element.value,
            }),
            defaultValues,
        );
    await handler(data);
    form.reset();
};

export default useForm;
