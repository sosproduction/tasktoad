export default function bootstrap(schema) {
    // Get the empty state according to our schema.
    const state = schema.getDefaultState();

    // Begin a mutating session with that state.
    // `state` will be mutated.
    const session = schema.withMutations(state);

    // Model classes are available as properties of the
    // Session instance.
    const { Task, Tag, Project } = session;

    // Start by creating entities whose props are not dependent
    // on others.
    const project = Project.create({
        id: 0, // optional. If omitted, Redux-ORM uses a number sequence starting from 0.
        name: 'Project 1',
    });
    const otherProject = Project.create({
        id: 1, // optional.
        name: 'Project 2',
    });

    // Tags to start with.
    const work = Tag.create({ name: 'work' });
    const personal = Tag.create({ name: 'personal' });
    const urgent = Tag.create({ name: 'urgent' });
    const chore = Tag.create({ name: 'chore' });

    // Tasks for `project`
    Task.create({
        text: 'Buy groceries',
        project,
        tags: [personal], // We could also pass ids instead of the Tag instances.
    });
    Task.create({
        text: 'Attend meeting',
        project,
        tags: [work],
    });
    Task.create({
        text: 'Pay bills',
        project,
        tags: [personal, urgent],
    });

    // Tasks for `otherProject`
    Task.create({
        text: 'Prepare meals for the week',
        project: otherProject,
        tags: [personal, chore],
    });
    Task.create({
        text: 'Fix the washing machine',
        project: otherProject,
        tags: [personal, chore],
    });
    Task.create({
        text: 'Negotiate internet subscription',
        project: otherProject,
        tags: [personal, urgent],
    });

    // Return the whole Redux initial state.
    return {
        orm: state,
        selectedProjectId: 0,
    };
}
