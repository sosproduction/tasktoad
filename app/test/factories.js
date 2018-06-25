import _factory from 'factory-girl';
import { Task, Project, Tag } from '../models';
import bluebird from 'bluebird';
import { ReduxORMAdapter } from './utils';

// factory-girl only works asynchronously with associated models,
// so we need to roll with that even though Redux-ORM is synchronous.
// We promisify factory-girl so we can use Promises instead of callbacks.
const factory = _factory.promisify(bluebird);

factory.define('Task', 'Task', {
    id: factory.sequence(n => n),
    text: factory.sequence(n => `Task ${n}`),
    project: factory.assoc('Project', 'id'),
    tags: factory.assocMany('Tag', 'name', 4), // 4 tags for each Task
    done: factory.sequence(n => n % 2 ? true : false),
});

factory.define('Project', 'Project', {
    id: factory.sequence(n => n),
    name: factory.sequence(n => `Project ${n}`),
});

factory.define('Tag', 'Tag', {
    name: factory.sequence(n => `Tag ${n}`),
});

export default factory;
