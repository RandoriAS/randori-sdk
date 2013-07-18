/** Compiled by the Randori compiler v0.2.5.2 on Wed Jul 17 11:20:29 CDT 2013 */


// ====================================================
// guice.utilities.GlobalUtilities
// ====================================================



$inherit = function(ce, ce2) {
if (typeof (Object.getOwnPropertyNames) == 'undefined') {

	for (var p in ce2.prototype)
		if (typeof (ce.prototype[p]) == 'undefined' || ce.prototype[p] == Object.prototype[p])
			ce.prototype[p] = ce2.prototype[p];
	for (var p in ce2)
		if (typeof (ce[p]) == 'undefined')
			ce[p] = ce2[p];
	ce.$baseCtor = ce2;

} else {

	var props = Object.getOwnPropertyNames(ce2.prototype);
	for (var i = 0; i < props.length; i++)
		if (typeof (Object.getOwnPropertyDescriptor(ce.prototype, props[i])) == 'undefined')
			Object.defineProperty(ce.prototype, props[i], Object.getOwnPropertyDescriptor(ce2.prototype, props[i]));

	for (var p in ce2)
		if (typeof (ce[p]) == 'undefined')
			ce[p] = ce2[p];
	ce.$baseCtor = ce2;

}

};

$createStaticDelegate = function(scope, func) {
	if (scope == null || func == null)
    return func;

//dont double wrap
if(func.scope==scope && func.func==func)
    return func;

//create the cache in the scope of the object holding the function to which you are delegating
//this prevents our cache from causing GC issues as everything should be resolvable albeit circular references
var ar = scope.$delegateCache;
if ( !ar ) {
    ar = scope.$delegateCache = [];
} else {
    for ( var i=0; i<ar.length; i++ ) {
        if ( ar[i].func == func ) {
            return ar[i];
        }
    }
}

var delegate = function () {
    return func.apply(scope, arguments);
};

delegate.func = func;
delegate.scope = scope;

ar.push( delegate );

return delegate;

	return null;
};


// ====================================================
// guice.InjectionClassBuilder
// ====================================================

if (typeof guice == "undefined")
	var guice = {};

guice.InjectionClassBuilder = function(injector, classResolver, factory) {
	this.injector = injector;
	this.classResolver = classResolver;
	this.factory = factory;
};

guice.InjectionClassBuilder.prototype.buildContext = function(className) {
	var td = this.classResolver.resolveClassName(className, {}, false);
	var classDependencies = td.getRuntimeDependencies();
	for (var i = 0; i < classDependencies.length; i++) {
		this.factory.getDefinitionForName(classDependencies[i]);
	}
	return this.injector.getInstanceByDefinition(td);
};

guice.InjectionClassBuilder.prototype.buildClass = function(className) {
	var td = this.factory.getDefinitionForName(className);
	return this.injector.getInstanceByDefinition(td);
};

guice.InjectionClassBuilder.className = "guice.InjectionClassBuilder";

guice.InjectionClassBuilder.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.InjectionClassBuilder.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.InjectionClassBuilder.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'injector', t:'guice.IInjector'});
			p.push({n:'classResolver', t:'guice.resolver.ClassResolver'});
			p.push({n:'factory', t:'guice.reflection.TypeDefinitionFactory'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.ProviderTypeBinding
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};

guice.binding.ProviderTypeBinding = function(typeDefinition, providerTypeDefinition, classResolver) {
	this.provider = null;
	this.isProxiedDefinition = false;
	this.typeDefinition = typeDefinition;
	this.providerTypeDefinition = providerTypeDefinition;
	this.classResolver = classResolver;
	if (providerTypeDefinition.get_isProxy()) {
		this.isProxiedDefinition = true;
	}
};

guice.binding.ProviderTypeBinding.prototype.getTypeName = function() {
	return this.typeDefinition.getClassName();
};

guice.binding.ProviderTypeBinding.prototype.getScope = function() {
	return 0;
};

guice.binding.ProviderTypeBinding.prototype.destroy = function() {
	this.provider = null;
	this.typeDefinition = null;
	this.providerTypeDefinition = null;
};

guice.binding.ProviderTypeBinding.prototype.provide = function(injector) {
	if (this.provider == null) {
		if (this.isProxiedDefinition) {
			this.providerTypeDefinition = this.classResolver.resolveProxy(this.providerTypeDefinition, {});
		}
		this.provider = injector.getInstanceByDefinition(this.providerTypeDefinition);
	}
	return this.provider.get();
};

guice.binding.ProviderTypeBinding.className = "guice.binding.ProviderTypeBinding";

guice.binding.ProviderTypeBinding.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.binding.ProviderTypeBinding.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.ProviderTypeBinding.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'typeDefinition', t:'guice.reflection.TypeDefinition'});
			p.push({n:'providerTypeDefinition', t:'guice.reflection.TypeDefinition'});
			p.push({n:'classResolver', t:'guice.resolver.IClassResolver'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.BindingFactory
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};

guice.binding.BindingFactory = function(binder, typeDefinition, factory, classResolver) {
	this.scope = 0;
	this.binder = binder;
	this.typeDefinition = typeDefinition;
	this.factory = factory;
	this.classResolver = classResolver;
};

guice.binding.BindingFactory.prototype.to = function(dependency) {
	var abstractBinding = this.withDecoration(new guice.binding.TypeBinding(this.typeDefinition, this.factory.getDefinitionForType(dependency), this.classResolver));
	this.binder.addBinding(abstractBinding);
	return abstractBinding;
};

guice.binding.BindingFactory.prototype.toInstance = function(instance) {
	var abstractBinding = this.withDecoration(new guice.binding.InstanceBinding(this.typeDefinition, instance));
	this.binder.addBinding(abstractBinding);
	return abstractBinding;
};

guice.binding.BindingFactory.prototype.toProvider = function(providerType) {
	var abstractBinding = this.withDecoration(new guice.binding.ProviderTypeBinding(this.typeDefinition, this.factory.getDefinitionForType(providerType), this.classResolver));
	this.binder.addBinding(abstractBinding);
	return abstractBinding;
};

guice.binding.BindingFactory.prototype.toProviderInstance = function(provider) {
	var abstractBinding = this.withDecoration(new guice.binding.ProviderBinding(this.typeDefinition, provider));
	this.binder.addBinding(abstractBinding);
	return abstractBinding;
};

guice.binding.BindingFactory.prototype.inScope = function(scope) {
	this.scope = scope;
	return this;
};

guice.binding.BindingFactory.prototype.withDecoration = function(abstractBinding) {
	if (this.scope == 2) {
		abstractBinding = new guice.binding.decorator.ContextDecorator(abstractBinding);
	} else if (this.scope == 1) {
		abstractBinding = new guice.binding.decorator.SingletonDecorator(abstractBinding);
	}
	return abstractBinding;
};

guice.binding.BindingFactory.className = "guice.binding.BindingFactory";

guice.binding.BindingFactory.getRuntimeDependencies = function(t) {
	var p;
	p = [];
	p.push('guice.binding.decorator.ContextDecorator');
	p.push('guice.binding.ProviderTypeBinding');
	p.push('guice.binding.InstanceBinding');
	p.push('guice.binding.TypeBinding');
	p.push('guice.binding.decorator.SingletonDecorator');
	p.push('guice.binding.ProviderBinding');
	return p;
};

guice.binding.BindingFactory.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.BindingFactory.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'binder', t:'guice.binding.IBinder'});
			p.push({n:'typeDefinition', t:'guice.reflection.TypeDefinition'});
			p.push({n:'factory', t:'guice.reflection.TypeDefinitionFactory'});
			p.push({n:'classResolver', t:'guice.resolver.IClassResolver'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.reflection.TypeDefinitionFactory
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.reflection == "undefined")
	guice.reflection = {};

guice.reflection.TypeDefinitionFactory = function() {
};

guice.reflection.TypeDefinitionFactory.prototype.findDefinition = function(qualifiedClassName) {
	var nextLevel = window;
	var failed = false;
	if (qualifiedClassName.charAt(0) == "*") {
		qualifiedClassName = qualifiedClassName.substr(1, 2147483647);
	}
	var path = qualifiedClassName.split(".", 4.294967295E9);
	for (var i = 0; i < path.length; i++) {
		nextLevel = nextLevel[path[i]];
		if (!nextLevel) {
			failed = true;
			break;
		}
	}
	if (failed) {
		return null;
	}
	return nextLevel;
};

guice.reflection.TypeDefinitionFactory.prototype.createEmptyDefinition = function(qualifiedClassName) {
	var nextLevel = window;
	var neededLevel;
	if (qualifiedClassName.charAt(0) == "*") {
		qualifiedClassName = qualifiedClassName.substr(1, 2147483647);
	}
	var path = qualifiedClassName.split(".", 4.294967295E9);
	for (var i = 0; i < path.length; i++) {
		neededLevel = nextLevel[path[i]];
		if (!neededLevel) {
			nextLevel[path[i]] = neededLevel = {};
		}
		nextLevel = neededLevel;
	}
	return neededLevel;
};

guice.reflection.TypeDefinitionFactory.prototype.buildProxyObjectForDependency = function(qualifiedClassName) {
	var proxy = this.createEmptyDefinition(qualifiedClassName);
	if (!proxy.className) {
		proxy.className = qualifiedClassName;
		proxy.isProxy = true;
	}
	return proxy;
};

guice.reflection.TypeDefinitionFactory.prototype.getDefinitionForName = function(name) {
	var type = this.findDefinition(name);
	var typeDefinition;
	if (type != null) {
		typeDefinition = this.getDefinitionForType(type);
	} else {
		typeDefinition = this.getDefinitionForType(this.buildProxyObjectForDependency(name));
	}
	return typeDefinition;
};

guice.reflection.TypeDefinitionFactory.prototype.getDefinitionForType = function(type) {
	return new guice.reflection.TypeDefinition(type);
};

guice.reflection.TypeDefinitionFactory.className = "guice.reflection.TypeDefinitionFactory";

guice.reflection.TypeDefinitionFactory.getRuntimeDependencies = function(t) {
	var p;
	p = [];
	p.push('guice.reflection.TypeDefinition');
	return p;
};

guice.reflection.TypeDefinitionFactory.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.reflection.TypeDefinitionFactory.injectionPoints = function(t) {
	return [];
};

// ====================================================
// guice.module.InlineModule
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.module == "undefined")
	guice.module = {};

guice.module.InlineModule = function(configFunction) {
	this.configFunction = configFunction;
};

guice.module.InlineModule.prototype.configure = function(binder) {
	if (this.configFunction != null)
		this.configFunction(binder);
};

guice.module.InlineModule.className = "guice.module.InlineModule";

guice.module.InlineModule.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.module.InlineModule.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.module.InlineModule.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'configFunction', t:'Function'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.InstanceBinding
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};

guice.binding.InstanceBinding = function(typeDefinition, instance) {
	this.typeDefinition = typeDefinition;
	this.instance = instance;
};

guice.binding.InstanceBinding.prototype.getTypeName = function() {
	return this.typeDefinition.getClassName();
};

guice.binding.InstanceBinding.prototype.getScope = function() {
	return 0;
};

guice.binding.InstanceBinding.prototype.destroy = function() {
	this.typeDefinition = null;
};

guice.binding.InstanceBinding.prototype.provide = function(injector) {
	return this.instance;
};

guice.binding.InstanceBinding.className = "guice.binding.InstanceBinding";

guice.binding.InstanceBinding.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.binding.InstanceBinding.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.InstanceBinding.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'typeDefinition', t:'guice.reflection.TypeDefinition'});
			p.push({n:'instance', t:'Object'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.ProviderBinding
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};

guice.binding.ProviderBinding = function(typeDefinition, provider) {
	this.typeDefinition = typeDefinition;
	this.provider = provider;
};

guice.binding.ProviderBinding.prototype.getTypeName = function() {
	return this.typeDefinition.getClassName();
};

guice.binding.ProviderBinding.prototype.getScope = function() {
	return 0;
};

guice.binding.ProviderBinding.prototype.destroy = function() {
	this.provider = null;
	this.typeDefinition = null;
};

guice.binding.ProviderBinding.prototype.provide = function(injector) {
	return this.provider.get();
};

guice.binding.ProviderBinding.className = "guice.binding.ProviderBinding";

guice.binding.ProviderBinding.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.binding.ProviderBinding.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.ProviderBinding.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'typeDefinition', t:'guice.reflection.TypeDefinition'});
			p.push({n:'provider', t:'guice.binding.provider.IProvider'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.utilities.InjectionDecorator
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.utilities == "undefined")
	guice.utilities = {};

guice.utilities.InjectionDecorator = function() {
};

guice.utilities.InjectionDecorator.prototype.decorateObject = function(dependency, className) {
	var injectableType = dependency;
	injectableType.injectionPoints = defaultInjectionPoints;
	injectableType.getClassDependencies = getClassDependencies;
	injectableType.className = className;
};

guice.utilities.InjectionDecorator.defaultInjectionPoints = function(t) {
};

guice.utilities.InjectionDecorator.getClassDependencies = function() {
	return [];
};

guice.utilities.InjectionDecorator.className = "guice.utilities.InjectionDecorator";

guice.utilities.InjectionDecorator.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.utilities.InjectionDecorator.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.utilities.InjectionDecorator.injectionPoints = function(t) {
	return [];
};
guice.utilities.InjectionDecorator$InjectableType = function() {
	this.className = null;
	this.injectionPoints = null;
	this.getClassDependencies = null;
	
};


// ====================================================
// guice.binding.decorator.ContextDecorator
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};
if (typeof guice.binding.decorator == "undefined")
	guice.binding.decorator = {};

guice.binding.decorator.ContextDecorator = function(sourceBinding) {
	this.instance = null;
	this.sourceBinding = sourceBinding;
};

guice.binding.decorator.ContextDecorator.prototype.getTypeName = function() {
	return this.sourceBinding.getTypeName();
};

guice.binding.decorator.ContextDecorator.prototype.getScope = function() {
	return 2;
};

guice.binding.decorator.ContextDecorator.prototype.destroy = function() {
	this.sourceBinding.destroy();
	this.instance = null;
};

guice.binding.decorator.ContextDecorator.prototype.provide = function(injector) {
	if (this.instance == null) {
		this.instance = this.sourceBinding.provide(injector);
	}
	return this.instance;
};

guice.binding.decorator.ContextDecorator.className = "guice.binding.decorator.ContextDecorator";

guice.binding.decorator.ContextDecorator.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.binding.decorator.ContextDecorator.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.decorator.ContextDecorator.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'sourceBinding', t:'guice.binding.IBinding'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.decorator.SingletonDecorator
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};
if (typeof guice.binding.decorator == "undefined")
	guice.binding.decorator = {};

guice.binding.decorator.SingletonDecorator = function(sourceBinding) {
	guice.binding.decorator.ContextDecorator.call(this, sourceBinding);
};

guice.binding.decorator.SingletonDecorator.prototype.getScope = function() {
	return 1;
};

$inherit(guice.binding.decorator.SingletonDecorator, guice.binding.decorator.ContextDecorator);

guice.binding.decorator.SingletonDecorator.className = "guice.binding.decorator.SingletonDecorator";

guice.binding.decorator.SingletonDecorator.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.binding.decorator.SingletonDecorator.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.decorator.SingletonDecorator.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'sourceBinding', t:'guice.binding.IBinding'});
			break;
		case 1:
			p = guice.binding.decorator.ContextDecorator.injectionPoints(t);
			break;
		case 2:
			p = guice.binding.decorator.ContextDecorator.injectionPoints(t);
			break;
		case 3:
			p = guice.binding.decorator.ContextDecorator.injectionPoints(t);
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.Binder
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};

guice.binding.Binder = function(hashMap, factory, classResolver) {
	this.hashMap = hashMap;
	this.factory = factory;
	this.classResolver = classResolver;
};

guice.binding.Binder.prototype.getBinding = function(typeDefinition) {
	return this.hashMap[typeDefinition.getClassName()];
};

guice.binding.Binder.prototype.addBinding = function(abstractBinding) {
	this.hashMap[abstractBinding.getTypeName()] = abstractBinding;
};

guice.binding.Binder.prototype.destroy = function() {
	var $1;
	for (var $0 in ($1 = this.hashMap)) {
		var binding = $1[$0];
		binding.destroy()
	}
	this.hashMap = null;
};

guice.binding.Binder.prototype.unbind = function(type) {
	var typeDefinition = this.factory.getDefinitionForType(type);
	var existingBinding = this.getBinding(typeDefinition);
	if (existingBinding) {
		delete this.hashMap[existingBinding.getTypeName()];
		existingBinding.destroy();
	}
};

guice.binding.Binder.prototype.bind = function(type) {
	var typeDefinition = this.factory.getDefinitionForType(type);
	var existingBinding = this.getBinding(typeDefinition);
	if (existingBinding != null) {
		if (existingBinding.getScope() == 1) {
			throw new Error("Overriding bindings for Singleton Scoped injections is not allowed.", 0);
		}
	}
	return new guice.binding.BindingFactory(this, typeDefinition, this.factory, this.classResolver);
};

guice.binding.Binder.className = "guice.binding.Binder";

guice.binding.Binder.getRuntimeDependencies = function(t) {
	var p;
	p = [];
	p.push('guice.binding.BindingFactory');
	return p;
};

guice.binding.Binder.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.Binder.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'hashMap', t:'Object'});
			p.push({n:'factory', t:'guice.reflection.TypeDefinitionFactory'});
			p.push({n:'classResolver', t:'guice.resolver.IClassResolver'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.ChildBinder
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};

guice.binding.ChildBinder = function(hashMap, factory, classResolver, parentBinder) {
	guice.binding.Binder.call(this, hashMap, factory, classResolver);
	this.parentBinder = parentBinder;
	this.bind(guice.binding.IBinder).toInstance(this);
	this.bind(guice.binding.Binder).toInstance(this);
};

guice.binding.ChildBinder.prototype.getBinding = function(typeDefinition) {
	var binding = guice.binding.Binder.prototype.getBinding.call(this,typeDefinition);
	if (binding == null) {
		binding = this.parentBinder.getBinding(typeDefinition);
	}
	return binding;
};

$inherit(guice.binding.ChildBinder, guice.binding.Binder);

guice.binding.ChildBinder.className = "guice.binding.ChildBinder";

guice.binding.ChildBinder.getRuntimeDependencies = function(t) {
	var p;
	p = [];
	p.push('guice.binding.Binder');
	p.push('*guice.binding.IBinder');
	return p;
};

guice.binding.ChildBinder.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.ChildBinder.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'hashMap', t:'Object'});
			p.push({n:'factory', t:'guice.reflection.TypeDefinitionFactory'});
			p.push({n:'classResolver', t:'guice.resolver.IClassResolver'});
			p.push({n:'parentBinder', t:'guice.binding.IBinder'});
			break;
		case 1:
			p = guice.binding.Binder.injectionPoints(t);
			break;
		case 2:
			p = guice.binding.Binder.injectionPoints(t);
			break;
		case 3:
			p = guice.binding.Binder.injectionPoints(t);
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.reflection.TypeDefinition
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.reflection == "undefined")
	guice.reflection = {};

guice.reflection.TypeDefinition = function(clazz) {
	this._builtIn = false;
	this._className = null;
	this._type = null;
	this._type = clazz;
	if (this.get_type().className == null) {
		this._builtIn = true;
	}
};

guice.reflection.TypeDefinition.Constructor = 0;

guice.reflection.TypeDefinition.Property = 1;

guice.reflection.TypeDefinition.Method = 2;

guice.reflection.TypeDefinition.View = 3;

guice.reflection.TypeDefinition.prototype.get_type = function() {
	return this._type;
};

guice.reflection.TypeDefinition.prototype.get_builtIn = function() {
	return this._builtIn;
};

guice.reflection.TypeDefinition.prototype.get_isProxy = function() {
	return this._type.isProxy;
};

guice.reflection.TypeDefinition.prototype.get_pending = function() {
	return this._type.pending;
};

guice.reflection.TypeDefinition.prototype.getClassName = function() {
	if (!this._className) {
		this._className = this._type.className;
		if (!this._className) {
			this._className = this._type.name;
			if (!this._className) {
				var functionDef = this._type.toString();
				var functionName = functionDef.substr(9, 2147483647);
				functionName = functionName.substring(0, functionName.indexOf("{", 0));
				this._className = functionName;
				if (!this._className) {
					throw new Error("Cannot determine class name of requested injection " + functionDef, 0);
				}
			}
		}
	}
	return this._className;
};

guice.reflection.TypeDefinition.prototype.getSuperClassName = function() {
	var className = this._type.superClassName;
	if (!className) {
		className = "Object";
	}
	return className;
};

guice.reflection.TypeDefinition.prototype.getStaticDependencies = function() {
	return this.get_type().getStaticDependencies();
};

guice.reflection.TypeDefinition.prototype.getRuntimeDependencies = function() {
	return this.get_type().getRuntimeDependencies();
};

guice.reflection.TypeDefinition.prototype.injectionPoints = function(injectionType) {
	return this.get_type().injectionPoints(injectionType);
};

guice.reflection.TypeDefinition.prototype.getInjectionMethods = function() {
	return this.injectionPoints(2);
};

guice.reflection.TypeDefinition.prototype.getInjectionFields = function() {
	return this.injectionPoints(1);
};

guice.reflection.TypeDefinition.prototype.getViewFields = function() {
	return this.injectionPoints(3);
};

guice.reflection.TypeDefinition.prototype.getConstructorParameters = function() {
	return this.injectionPoints(0);
};

guice.reflection.TypeDefinition.prototype.constructorApply = function(args) {
	var instance = null;
	if (this._builtIn) {
		instance = new (this.get_type())();
	} else {
		var f;
		var c;
		c = this.get_type();
		f = new Function();
		f.prototype = c.prototype;
		instance = new f();
		c.apply(instance, args);
		instance.constructor = c;
	}
	return instance;
};

guice.reflection.TypeDefinition.className = "guice.reflection.TypeDefinition";

guice.reflection.TypeDefinition.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.reflection.TypeDefinition.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.reflection.TypeDefinition.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'clazz', t:'Class'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.loader.URLRewriterBase
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.loader == "undefined")
	guice.loader = {};

guice.loader.URLRewriterBase = function(debugMode) {
};

guice.loader.URLRewriterBase.prototype.rewriteURL = function(url) {
	return url;
};

guice.loader.URLRewriterBase.className = "guice.loader.URLRewriterBase";

guice.loader.URLRewriterBase.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.loader.URLRewriterBase.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.loader.URLRewriterBase.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'debugMode', t:'Boolean'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.Injector
// ====================================================

if (typeof guice == "undefined")
	var guice = {};

guice.Injector = function(binder, classResolver, factory) {
	this.binder = binder;
	this.classResolver = classResolver;
	this.factory = factory;
};

guice.Injector.prototype.getInstance = function(dependency) {
	return this.resolveDependency(this.factory.getDefinitionForType(dependency), {});
};

guice.Injector.prototype.getInstanceByDefinition = function(dependencyTypeDefinition) {
	return this.resolveDependency(dependencyTypeDefinition, {});
};

guice.Injector.prototype.getBinding = function(typeDefinition) {
	return this.binder.getBinding(typeDefinition);
};

guice.Injector.prototype.buildClass = function(type, circularDependencyMap) {
	return this.buildClassFromDefinition(this.factory.getDefinitionForType(type), {});
};

guice.Injector.prototype.buildClassFromDefinition = function(typeDefinition, circularDependencyMap) {
	var instance;
	if (typeDefinition.get_builtIn()) {
		instance = typeDefinition.constructorApply(null);
	} else {
		if (typeDefinition.get_isProxy()) {
			typeDefinition = this.classResolver.resolveProxy(typeDefinition, circularDependencyMap);
		} else {
			circularDependencyMap[typeDefinition.getClassName()] = true;
		}
		var constructorPoints = typeDefinition.getConstructorParameters();
		instance = this.buildFromInjectionInfo(typeDefinition, constructorPoints, circularDependencyMap);
		var fieldPoints = typeDefinition.getInjectionFields();
		this.injectMemberPropertiesFromInjectionInfo(instance, fieldPoints, circularDependencyMap);
		var methodPoints = typeDefinition.getInjectionMethods();
		this.injectMembersMethodsFromInjectionInfo(instance, methodPoints, circularDependencyMap);
		delete circularDependencyMap[typeDefinition.getClassName()];
	}
	return instance;
};

guice.Injector.prototype.injectMembers = function(instance) {
	var constructor = instance.constructor;
	var typeDefinition = this.factory.getDefinitionForType(constructor);
	var circularDependencyMap = {};
	var fieldPoints = typeDefinition.getInjectionFields();
	this.injectMemberPropertiesFromInjectionInfo(instance, fieldPoints, circularDependencyMap);
	var methodPoints = typeDefinition.getInjectionMethods();
	this.injectMembersMethodsFromInjectionInfo(instance, methodPoints, circularDependencyMap);
};

guice.Injector.prototype.buildFromInjectionInfo = function(dependencyTypeDefinition, constructorPoints, circularDependencyMap) {
	var args = [];
	for (var i = 0; i < constructorPoints.length; i++) {
		args[i] = this.resolveDependency(this.factory.getDefinitionForName(constructorPoints[i].t), circularDependencyMap);
	}
	return dependencyTypeDefinition.constructorApply(args);
};

guice.Injector.prototype.injectMemberPropertiesFromInjectionInfo = function(instance, fieldPoints, circularDependencyMap) {
	for (var i = 0; i < fieldPoints.length; i++) {
		instance[fieldPoints[i].n] = this.resolveDependency(this.factory.getDefinitionForName(fieldPoints[i].t), circularDependencyMap);
	}
};

guice.Injector.prototype.injectMembersMethodsFromInjectionInfo = function(instance, methodPoints, circularDependencyMap) {
	for (var i = 0; i < methodPoints.length; i++) {
		var methodPoint = methodPoints[i];
		var args = [];
		for (var j = 0; j < methodPoint.p.length; j++) {
			var parameterPoint = methodPoint.p[j];
			args[j] = this.resolveDependency(this.factory.getDefinitionForName(parameterPoint.t), circularDependencyMap);
		}
		var action = instance[methodPoints[i].n];
		action.apply(instance, args);
	}
};

guice.Injector.prototype.resolveDependency = function(typeDefinition, circularDependencyMap) {
	var abstractBinding = null;
	if (circularDependencyMap[typeDefinition.getClassName()]) {
		throw new Error("Circular Reference While Resolving : " + typeDefinition.getClassName(), 0);
	}
	if (!typeDefinition.get_builtIn()) {
		abstractBinding = this.getBinding(typeDefinition);
	}
	var instance;
	if (abstractBinding != null) {
		instance = abstractBinding.provide(this);
	} else {
		instance = this.buildClassFromDefinition(typeDefinition, circularDependencyMap);
	}
	return instance;
};

guice.Injector.prototype.configureBinder = function(module) {
	if (module != null) {
		module.configure(this.binder);
	}
};

guice.Injector.className = "guice.Injector";

guice.Injector.getRuntimeDependencies = function(t) {
	var p;
	p = [];
	p.push('Object');
	return p;
};

guice.Injector.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.Injector.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'binder', t:'guice.binding.IBinder'});
			p.push({n:'classResolver', t:'guice.resolver.IClassResolver'});
			p.push({n:'factory', t:'guice.reflection.TypeDefinitionFactory'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.ChildInjector
// ====================================================

if (typeof guice == "undefined")
	var guice = {};

guice.ChildInjector = function(binder, classResolver, factory) {
	guice.Injector.call(this, binder, classResolver, factory);
	binder.bind(guice.IInjector).toInstance(this);
	binder.bind(guice.Injector).toInstance(this);
};

$inherit(guice.ChildInjector, guice.Injector);

guice.ChildInjector.className = "guice.ChildInjector";

guice.ChildInjector.getRuntimeDependencies = function(t) {
	var p;
	p = [];
	p.push('*guice.IInjector');
	p.push('guice.Injector');
	return p;
};

guice.ChildInjector.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.ChildInjector.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'binder', t:'guice.binding.IChildBinder'});
			p.push({n:'classResolver', t:'guice.resolver.IClassResolver'});
			p.push({n:'factory', t:'guice.reflection.TypeDefinitionFactory'});
			break;
		case 1:
			p = guice.Injector.injectionPoints(t);
			break;
		case 2:
			p = guice.Injector.injectionPoints(t);
			break;
		case 3:
			p = guice.Injector.injectionPoints(t);
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.loader.SynchronousClassLoader
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.loader == "undefined")
	guice.loader = {};

guice.loader.SynchronousClassLoader = function(xmlHttpRequest, urlRewriter, dynamicClassBaseUrl) {
	this.xmlHttpRequest = xmlHttpRequest;
	this.urlRewriter = urlRewriter;
	this.dynamicClassBaseUrl = dynamicClassBaseUrl;
};

guice.loader.SynchronousClassLoader.prototype.loadClass = function(qualifiedClassName) {
	var classNameRegex = new RegExp("\\.", "g");
	var potentialURL = qualifiedClassName.replace(classNameRegex, "\/");
	potentialURL = this.dynamicClassBaseUrl + potentialURL;
	potentialURL += ".js";
	this.xmlHttpRequest.open("GET", this.urlRewriter.rewriteURL(potentialURL), false);
	this.xmlHttpRequest.send();
	if (this.xmlHttpRequest.status == 404) {
		throw new Error("Cannot continue, missing an implementation for required asset " + qualifiedClassName, 0);
	}
	return (this.xmlHttpRequest.responseText + "\n\/\/@ sourceURL=" + potentialURL);
};

guice.loader.SynchronousClassLoader.className = "guice.loader.SynchronousClassLoader";

guice.loader.SynchronousClassLoader.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.loader.SynchronousClassLoader.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.loader.SynchronousClassLoader.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'xmlHttpRequest', t:'XMLHttpRequest'});
			p.push({n:'urlRewriter', t:'guice.loader.URLRewriterBase'});
			p.push({n:'dynamicClassBaseUrl', t:'String'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.resolver.ClassResolver
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.resolver == "undefined")
	guice.resolver = {};

guice.resolver.ClassResolver = function(loader, factory) {
	this.loader = loader;
	this.factory = factory;
};

guice.resolver.ClassResolver.prototype.resolveProxy = function(proxy, circularDependencyMap) {
	return this.resolveClassName(proxy.getClassName(), circularDependencyMap, true);
};

guice.resolver.ClassResolver.prototype.resolveClassName = function(qualifiedClassName, circularDependencyMap, resolveRuntimeDependencyies) {
	var td = this.factory.getDefinitionForName(qualifiedClassName);
	if (td.get_isProxy()) {
		if (circularDependencyMap[qualifiedClassName]) {
			throw new Error("Circular Reference While Resolving Name : " + qualifiedClassName, 0);
		}
		circularDependencyMap[qualifiedClassName] = true;
		var classDefinition = this.loader.loadClass(qualifiedClassName);
		this.resolveParentClassFromDefinition(qualifiedClassName, classDefinition, circularDependencyMap);
		this.addDefinition(this.getStubDefinition(qualifiedClassName, classDefinition));
		td = this.factory.getDefinitionForName(qualifiedClassName);
		if (td.get_builtIn()) {
			throw new Error(qualifiedClassName + " was not built with the Randori compiler or has not been decorated prior to injection ", 0);
		}
		this.resolveStaticDependencies(td, circularDependencyMap);
		delete circularDependencyMap[qualifiedClassName];
		this.addDefinition(classDefinition);
		td = this.factory.getDefinitionForName(qualifiedClassName);
		if (resolveRuntimeDependencyies) {
			this.resolveRuntimeDependencies(td);
		}
	} else if (td.get_pending()) {
		throw new Error("Circular Reference While Resolving Partial Class : " + qualifiedClassName, 0);
	}
	return td;
};

guice.resolver.ClassResolver.prototype.resolveStaticDependencies = function(type, circularDependencyMap) {
	var classDependencies = type.getStaticDependencies();
	for (var i = 0; i < classDependencies.length; i++) {
		if (classDependencies[i].charAt(0) != "*") {
			this.resolveClassName(classDependencies[i], circularDependencyMap, true);
		}
	}
};

guice.resolver.ClassResolver.prototype.resolveRuntimeDependencies = function(type) {
	var classDependencies = type.getRuntimeDependencies();
	for (var i = 0; i < classDependencies.length; i++) {
		if (classDependencies[i].charAt(0) != "*") {
			this.resolveClassName(classDependencies[i], {}, true);
		}
	}
};

guice.resolver.ClassResolver.prototype.getStubDefinition = function(qualifiedClassName, classDefinition) {
	var stubDefinition = "";
	var escapedClassName = qualifiedClassName.replace(".", ".");
	var preambleExpression = "(^[\\W\\w]+?)" + escapedClassName;
	var classNameExpression = escapedClassName + ".className = [\\w\\W]+?\\\";";
	var dependenciesExpression = escapedClassName + ".getStaticDependencies[\\w\\W]+?};";
	var preambleResult = classDefinition.match(preambleExpression);
	var classNameResult = classDefinition.match(classNameExpression);
	var dependencyResult = classDefinition.match(dependenciesExpression);
	if (preambleResult != null && preambleResult.length > 1) {
		stubDefinition += preambleResult[1];
		stubDefinition += "\n";
	}
	stubDefinition += (qualifiedClassName + " = function() {}\n");
	stubDefinition += (qualifiedClassName + ".pending = true;\n");
	if (classNameResult != null) {
		stubDefinition += classNameResult[0];
		stubDefinition += "\n";
	}
	if (dependencyResult != null) {
		stubDefinition += dependencyResult[0];
		stubDefinition += "\n";
	}
	return stubDefinition;
};

guice.resolver.ClassResolver.prototype.resolveParentClassFromDefinition = function(qualifiedClassName, classDefinition, circularDependencyMap) {
	var inheritString = "\\$inherit\\(";
	inheritString += qualifiedClassName;
	inheritString += ",\\s*(.*?)\\)";
	var inheritResult = classDefinition.match(inheritString);
	if (inheritResult != null) {
		this.resolveClassName(inheritResult[1], circularDependencyMap, true);
	}
};

guice.resolver.ClassResolver.prototype.addDefinition = function(definitionText) {
var globalEval = (function () {

    var isIndirectEvalGlobal = (function (original, Object) {
        try {
            // Does `Object` resolve to a local variable, or to a global, built-in `Object`,
            // reference to which we passed as a first argument?
            return (1, eval)('Object') === original;
        }
        catch (err) {
            // if indirect eval errors out (as allowed per ES3), then just bail out with `false`
            return false;
        }
    })(Object, 123);

    if (isIndirectEvalGlobal) {

        // if indirect eval executes code globally, use it
        return function (expression) {
            return (1, eval)(expression);
        };
    }
    else if (typeof window.execScript !== 'undefined') {

        // if `window.execScript exists`, use it
        return function (expression) {
            return window.execScript(expression);
        };
    }

    // otherwise, globalEval is `undefined` since nothing is returned
})();

globalEval(definitionText);

};

guice.resolver.ClassResolver.className = "guice.resolver.ClassResolver";

guice.resolver.ClassResolver.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.resolver.ClassResolver.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.resolver.ClassResolver.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'loader', t:'guice.loader.SynchronousClassLoader'});
			p.push({n:'factory', t:'guice.reflection.TypeDefinitionFactory'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.GuiceJs
// ====================================================

if (typeof guice == "undefined")
	var guice = {};

guice.GuiceJs = function(loader) {
	this.loader = loader;
};

guice.GuiceJs.prototype.createInjector = function(module) {
	var factory = new guice.reflection.TypeDefinitionFactory();
	var hashMap = {};
	var classResolver = new guice.resolver.ClassResolver(this.loader, factory);
	var binder = new guice.binding.Binder(hashMap, factory, classResolver);
	if (module != null) {
		module.configure(binder);
	}
	factory.getDefinitionForName("guice.IInjector");
	factory.getDefinitionForName("guice.IChildInjector");
	factory.getDefinitionForName("guice.binding.IBinder");
	factory.getDefinitionForName("guice.binding.IChildBinder");
	factory.getDefinitionForName("guice.resolver.IClassResolver");
	factory.getDefinitionForName("robotlegs.flexo.command.ICommandMap");
	factory.getDefinitionForName("robotlegs.flexo.context.IContextInitialized");
	factory.getDefinitionForName("robotlegs.flexo.context.IContextDestroyed");
	var injector = new guice.Injector(binder, classResolver, factory);
	binder.bind(guice.Injector).toInstance(injector);
	binder.bind(guice.IInjector).toInstance(injector);
	binder.bind(guice.IChildInjector).to(guice.ChildInjector);
	binder.bind(guice.binding.IBinder).toInstance(binder);
	binder.bind(guice.binding.Binder).toInstance(binder);
	binder.bind(guice.binding.IChildBinder).to(guice.binding.ChildBinder);
	binder.bind(guice.reflection.TypeDefinitionFactory).toInstance(factory);
	binder.bind(guice.resolver.IClassResolver).toInstance(classResolver);
	binder.bind(guice.resolver.ClassResolver).toInstance(classResolver);
	binder.bind(guice.loader.SynchronousClassLoader).toInstance(this.loader);
	return injector;
};

guice.GuiceJs.prototype.configureInjector = function(injector, module) {
	injector.configureBinder(module);
};

guice.GuiceJs.className = "guice.GuiceJs";

guice.GuiceJs.getRuntimeDependencies = function(t) {
	var p;
	p = [];
	p.push('guice.binding.ChildBinder');
	p.push('*guice.binding.IBinder');
	p.push('guice.binding.Binder');
	p.push('*guice.resolver.IClassResolver');
	p.push('guice.resolver.ClassResolver');
	p.push('guice.loader.SynchronousClassLoader');
	p.push('*guice.binding.IChildBinder');
	p.push('*guice.IInjector');
	p.push('guice.reflection.TypeDefinitionFactory');
	p.push('*guice.IChildInjector');
	p.push('guice.ChildInjector');
	p.push('guice.Injector');
	return p;
};

guice.GuiceJs.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.GuiceJs.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'loader', t:'guice.loader.SynchronousClassLoader'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};


// ====================================================
// guice.binding.TypeBinding
// ====================================================

if (typeof guice == "undefined")
	var guice = {};
if (typeof guice.binding == "undefined")
	guice.binding = {};

guice.binding.TypeBinding = function(typeDefinition, dependencyDefinition, classResolver) {
	this.isProxiedDefinition = false;
	this.typeDefinition = typeDefinition;
	this.dependencyDefinition = dependencyDefinition;
	this.classResolver = classResolver;
	if (dependencyDefinition.get_isProxy()) {
		this.isProxiedDefinition = true;
	}
};

guice.binding.TypeBinding.prototype.getTypeName = function() {
	return this.typeDefinition.getClassName();
};

guice.binding.TypeBinding.prototype.getScope = function() {
	return 0;
};

guice.binding.TypeBinding.prototype.destroy = function() {
	this.typeDefinition = null;
	this.dependencyDefinition = null;
};

guice.binding.TypeBinding.prototype.provide = function(injector) {
	if (this.isProxiedDefinition) {
		this.dependencyDefinition = this.classResolver.resolveProxy(this.dependencyDefinition, {});
	}
	return injector.buildClassFromDefinition(this.dependencyDefinition, {});
};

guice.binding.TypeBinding.className = "guice.binding.TypeBinding";

guice.binding.TypeBinding.getRuntimeDependencies = function(t) {
	var p;
	return [];
};

guice.binding.TypeBinding.getStaticDependencies = function(t) {
	var p;
	return [];
};

guice.binding.TypeBinding.injectionPoints = function(t) {
	var p;
	switch (t) {
		case 0:
			p = [];
			p.push({n:'typeDefinition', t:'guice.reflection.TypeDefinition'});
			p.push({n:'dependencyDefinition', t:'guice.reflection.TypeDefinition'});
			p.push({n:'classResolver', t:'guice.resolver.IClassResolver'});
			break;
		default:
			p = [];
			break;
	}
	return p;
};

